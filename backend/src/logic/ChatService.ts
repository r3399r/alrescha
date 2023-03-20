import { Readable } from 'stream';
import {
  Client,
  FollowEvent,
  MessageEvent,
  PostbackEvent,
  QuickReplyItem,
} from '@line/bot-sdk';
import { S3 } from 'aws-sdk';
import axios from 'axios';
import { fileTypeFromBuffer } from 'file-type';
import { inject, injectable } from 'inversify';
import { DbAccess } from 'src/access/DbAccess';
import { ImageAccess } from 'src/access/ImageAccess';
import { UserAccess } from 'src/access/UserAccess';
import { ViewUserAccess } from 'src/access/ViewUserAccess';
import { PRE_QUOTA } from 'src/constant/Quota';
import { ImageEntity } from 'src/model/db/ImageEntity';
import { UserEntity } from 'src/model/db/UserEntity';
import { BadRequestError } from 'src/model/error';
import { ReplicateResponse } from 'src/model/Replicate';
import { bn } from 'src/util/bignumber';

/**
 * Service class for chat
 */
@injectable()
export class ChatService {
  @inject(DbAccess)
  private readonly dbAccess!: DbAccess;

  @inject(UserAccess)
  private readonly userAccess!: UserAccess;

  @inject(ImageAccess)
  private readonly imageAccess!: ImageAccess;

  @inject(Client)
  private readonly client!: Client;

  @inject(S3)
  private readonly s3!: S3;

  @inject(ViewUserAccess)
  private readonly viewUserAccess!: ViewUserAccess;

  public async cleanup() {
    await this.dbAccess.cleanup();
  }

  public getReplyItems(): QuickReplyItem[] {
    return [
      {
        type: 'action',
        action: { type: 'cameraRoll', label: '上傳照片' },
      },
      {
        type: 'action',
        action: {
          type: 'uri',
          label: '瀏覽照片',
          uri: `https://liff.line.me/${process.env.LIFF_ID}/preview`,
        },
      },
      {
        type: 'action',
        action: {
          type: 'postback',
          label: '額度查詢',
          displayText: '額度查詢',
          data: 'quota',
        },
      },
      {
        type: 'action',
        action: {
          type: 'uri',
          label: '參數設定',
          uri: `https://liff.line.me/${process.env.LIFF_ID}/upload`,
        },
      },
      {
        type: 'action',
        action: {
          type: 'postback',
          label: '常見問題',
          displayText: '常見問題',
          data: 'faq',
        },
      },
      {
        type: 'action',
        action: {
          type: 'uri',
          label: '聯絡管理員',
          uri: 'https://docs.google.com/forms/d/e/1FAIpQLSdaWAnpxINF4m1msJQT-Qr9yAyukZHlUQSoEpZktv0ZId0n0Q/viewform?usp=sf_link',
        },
      },
    ];
  }

  public async follow(event: FollowEvent) {
    if (event.source.userId === undefined) return;
    const userId = event.source.userId;

    try {
      await this.dbAccess.startTransaction();

      const existingUser = await this.userAccess.findById(userId);
      if (existingUser !== null) return;

      const profile = await this.client.getProfile(userId);

      const user = new UserEntity();
      user.id = userId;
      user.name = profile.displayName;
      user.quota = 100;

      await this.userAccess.save(user);

      await this.client.replyMessage(event.replyToken, [
        {
          type: 'text',
          text: '你好！我是 AI 照片修復師，上傳模糊的舊照片，我幫你把它變高清！',
        },
        {
          type: 'image',
          previewImageUrl:
            'https://yue-public-bucket.s3.ap-southeast-1.amazonaws.com/replicate.jpg',
          originalContentUrl:
            'https://yue-public-bucket.s3.ap-southeast-1.amazonaws.com/replicate.jpg',
        },
        {
          type: 'text',
          text: '100 秒的免費運算時數已送給您，請隨意使用！',
          quickReply: { items: this.getReplyItems() },
        },
      ]);
      await this.dbAccess.commitTransaction();
    } catch (e) {
      await this.dbAccess.rollbackTransaction();
      throw e;
    }
  }

  public async postback(event: PostbackEvent) {
    if (event.postback.data === 'quota') {
      const userId = event.source.userId;
      const user = await this.viewUserAccess.findById(userId ?? '');

      await this.client.replyMessage(event.replyToken, [
        {
          type: 'text',
          text: `目前額度: ${user.quota} 秒\n您已修復 ${
            user.count
          } 張圖，每張圖平均花費 ${bn(user.avg).dp(2).toNumber()} 秒`,
          quickReply: { items: this.getReplyItems() },
        },
      ]);
    } else if (event.postback.data === 'faq')
      await this.client.replyMessage(event.replyToken, [
        {
          type: 'template',
          altText: '常見問題',
          template: {
            type: 'buttons',
            text: '請選擇您的問題',
            actions: [
              { type: 'postback', label: '使用教學', data: 'tutorial' },
              {
                type: 'postback',
                label: '如何取得額度？',
                data: 'increase-quota',
              },
              { type: 'postback', label: '如何生出圖的？', data: 'how' },
            ],
          },
          quickReply: { items: this.getReplyItems() },
        },
      ]);
    else if (event.postback.data === 'tutorial')
      await this.client.replyMessage(event.replyToken, [
        {
          type: 'text',
          text: '教學，要提醒圖片僅暫存 3 天',
          quickReply: { items: this.getReplyItems() },
        },
      ]);
    else if (event.postback.data === 'increase-quota')
      await this.client.replyMessage(event.replyToken, [
        {
          type: 'text',
          text: '免費額度：追蹤即贈送 100 秒額度；若額度介於 0~20 秒，將於每日 00:00 新增至 20 秒；若額度為負，將於每日 00:00 新增 20 秒',
        },
        {
          type: 'text',
          text: '您也可以直接付費購買額度，1 元 xx 秒。\n請匯款至 1234-56778，或用 line pay money 轉帳，轉帳代碼：312340019e32\n\n匯款完成後請主動聯繫管理員進行對帳',
          quickReply: { items: this.getReplyItems() },
        },
      ]);
    else if (event.postback.data === 'how')
      await this.client.replyMessage(event.replyToken, [
        {
          type: 'text',
          text: '好奇嗎',
          quickReply: { items: this.getReplyItems() },
        },
      ]);
  }

  public async message(event: MessageEvent) {
    if (event.message.type === 'text') {
      if (event.message.text !== '管理員')
        await this.client.replyMessage(event.replyToken, [
          {
            type: 'text',
            text: '遇到問題嗎？請在下方選擇一個，或打字輸入「管理員」',
            quickReply: {
              items: this.getReplyItems(),
            },
          },
        ]);
      else
        await this.client.replyMessage(event.replyToken, [
          {
            type: 'template',
            altText: '聯絡管理員',
            template: {
              type: 'buttons',
              text: '請點擊下方按鈕以聯絡管理員',
              actions: [
                {
                  type: 'uri',
                  label: '聯絡管理員',
                  uri: 'https://docs.google.com/forms/d/e/1FAIpQLSdaWAnpxINF4m1msJQT-Qr9yAyukZHlUQSoEpZktv0ZId0n0Q/viewform?usp=sf_link',
                },
              ],
            },
            quickReply: { items: this.getReplyItems() },
          },
        ]);

      return;
    }
    if (event.message.type !== 'image') return;
    if (event.source.userId === undefined) return;
    const userId = event.source.userId;

    try {
      await this.dbAccess.startTransaction();

      // pre-lock quota
      const user = await this.userAccess.findById(userId);
      if (user === null) throw new BadRequestError('no user found');
      if (user.quota < 0) {
        await this.client.replyMessage(event.replyToken, [
          {
            type: 'text',
            text: '額度可能不足，請新增額度',
            quickReply: { items: this.getReplyItems() },
          },
        ]);
        throw new BadRequestError('balance insufficient');
      }

      user.quota = bn(user.quota).minus(PRE_QUOTA).toNumber();
      await this.userAccess.update(user);

      const contentStream: Readable = await this.client.getMessageContent(
        event.message.id
      );

      const image = new ImageEntity();
      image.userId = userId;
      image.status = 'created';

      const newImage = await this.imageAccess.save(image);
      const bucket = `${process.env.PROJECT}-${process.env.ENVR}-predict`;

      const chunks = [];
      for await (const chunk of contentStream) chunks.push(chunk);

      const buffer = Buffer.concat(chunks);

      const fileType = await fileTypeFromBuffer(buffer);
      const filename = `${userId}/${newImage.id}.before.${fileType?.ext}`;
      const readableStream = new Readable({
        read() {
          this.push(buffer);
          this.push(null);
        },
      });
      await this.s3
        .upload({
          Body: readableStream,
          Bucket: bucket,
          Key: filename,
        })
        .promise();

      const url = this.s3.getSignedUrl('getObject', {
        Bucket: bucket,
        Key: filename,
      });

      const replicateResponse = await axios.request<ReplicateResponse>({
        data: {
          version:
            '7de2ea26c616d5bf2245ad0d5e24f0ff9a6204578a5c876db53142edd9d2cd56',
          input: {
            image: url,
            codeformer_fidelity: 0.7,
            background_enhance: true,
            face_upsample: true,
            upscale: 1,
          },
          webhook: `https://airepair${
            process.env.ENVR === 'test' ? '-test' : ''
          }.celestialstudio.net/api/predict/process?imageId=${
            newImage.id
          }&fileExt=${fileType?.ext}&replyToken=${event.replyToken}`,
          webhook_events_filter: ['completed'],
        },
        headers: {
          Authorization: `Token ${process.env.REPLICATE_TOKEN}`,
          'Content-Type': 'application/json',
        },
        url: 'https://api.replicate.com/v1/predictions',
        method: 'post',
      });

      newImage.predictId = replicateResponse.data.id;
      await this.imageAccess.save(newImage);

      await this.dbAccess.commitTransaction();
    } catch (e) {
      await this.dbAccess.rollbackTransaction();
      throw e;
    }
  }
}

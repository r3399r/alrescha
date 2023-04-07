import { Readable } from 'stream';
import {
  Client,
  FollowEvent,
  MessageEvent,
  PostbackEvent,
  QuickReply,
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

  public getReplyItems(): QuickReply {
    return {
      items: [
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
            uri: `https://liff.line.me/${process.env.LIFF_ID}/setting`,
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
            label: '聯繫管理員',
            uri: 'https://lin.ee/WSkDSDF',
          },
        },
      ],
    };
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
      user.codeformerFidelity = 0.7;
      user.backgroundEnhance = true;
      user.faceUpsample = true;
      user.upscale = 1;

      await this.userAccess.save(user);

      await this.client.replyMessage(event.replyToken, [
        {
          type: 'text',
          text: '你好！我是 AI 照片修復師，上傳模糊的舊照片，我幫你把它變高清！',
        },
        {
          type: 'image',
          previewImageUrl:
            'https://yue-public-bucket.s3.ap-southeast-1.amazonaws.com/alrescha-intro.jpg',
          originalContentUrl:
            'https://yue-public-bucket.s3.ap-southeast-1.amazonaws.com/alrescha-intro.jpg',
        },
        {
          type: 'text',
          text: '100 秒的免費運算時數已送給您，請隨意使用！',
          quickReply: this.getReplyItems(),
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
          type: 'template',
          altText: '目前額度',
          template: {
            type: 'buttons',
            text: `額度以 AI 算圖所花費的秒數作為單位。\n目前剩餘額度: ${
              user.quota
            } 秒\n您已修復 ${user.count ?? 0} 張圖\n每張圖平均花費 ${bn(
              user.avg
            )
              .dp(2)
              .toNumber()} 秒`,
            actions: [
              {
                type: 'uri',
                label: '如何取得更多額度？',
                uri: `https://liff.line.me/${process.env.LIFF_ID}/quota`,
              },
            ],
          },
          quickReply: this.getReplyItems(),
        },
      ]);
    } else if (event.postback.data === 'faq')
      await this.client.replyMessage(event.replyToken, [
        {
          type: 'template',
          altText: '常見問題',
          template: {
            type: 'buttons',
            text: '請選擇問題',
            actions: [
              {
                type: 'postback',
                displayText: '上傳照片',
                label: '上傳照片',
                data: 'q-1',
              },
              {
                type: 'postback',
                displayText: '瀏覽照片',
                label: '瀏覽照片',
                data: 'q-2',
              },
              {
                type: 'postback',
                displayText: '額度相關',
                label: '額度相關',
                data: 'q-3',
              },
              {
                type: 'postback',
                displayText: '原理介紹',
                label: '原理介紹',
                data: 'q-4',
              },
            ],
          },
          quickReply: this.getReplyItems(),
        },
      ]);
    else if (event.postback.data === 'q-1')
      await this.client.replyMessage(event.replyToken, [
        {
          type: 'text',
          text: '將照片傳送到聊天室，稍待幾秒，AI 修復師就會將修好的圖傳送回來。',
        },
        {
          type: 'text',
          text: '若原始圖片過大導致 AI 計算超過 1 分鐘，則不會從聊天室傳送結果回來，但仍可以在「瀏覽照片」中找到修好的圖',
          quickReply: this.getReplyItems(),
        },
      ]);
    else if (event.postback.data === 'q-2')
      await this.client.replyMessage(event.replyToken, [
        {
          type: 'text',
          text: '可至「瀏覽照片」看之前傳過的照片，圖檔只保存 3 天，超過將會自動刪除',
          quickReply: this.getReplyItems(),
        },
      ]);
    else if (event.postback.data === 'q-3')
      await this.client.replyMessage(event.replyToken, [
        {
          type: 'template',
          altText: '額度介紹',
          template: {
            type: 'buttons',
            text: '請選擇項目',
            actions: [
              {
                type: 'postback',
                displayText: '額度查詢',
                label: '額度查詢',
                data: 'quota',
              },
              {
                type: 'postback',
                displayText: '我能擁有多少免費額度？',
                label: '我能擁有多少免費額度？',
                data: 'q-3-2',
              },
              {
                type: 'uri',
                label: '如何取得更多額度？',
                uri: `https://liff.line.me/${process.env.LIFF_ID}/quota`,
              },
              {
                type: 'postback',
                displayText: '更多細節',
                label: '更多細節',
                data: 'q-3-4',
              },
            ],
          },
          quickReply: this.getReplyItems(),
        },
      ]);
    else if (event.postback.data === 'q-3-2')
      await this.client.replyMessage(event.replyToken, [
        {
          type: 'text',
          text: '追蹤即贈送 100 秒額度。\n若剩餘額度介於 0~20 秒，將於每日 00:00 新增至 20 秒。\n若剩餘額度為負，將於每日 00:00 新增 20 秒。',
        },
        {
          type: 'image',
          previewImageUrl:
            'https://yue-public-bucket.s3.ap-southeast-1.amazonaws.com/alrescha-info.png',
          originalContentUrl:
            'https://yue-public-bucket.s3.ap-southeast-1.amazonaws.com/alrescha-info.png',
          quickReply: this.getReplyItems(),
        },
      ]);
    else if (event.postback.data === 'q-3-4')
      await this.client.replyMessage(event.replyToken, [
        {
          type: 'text',
          text: '每張圖在計算前會預扣 15 秒額度，算圖完成後會將此額度補回。\n若剩餘額度不足時，會收到提示訊息，請補充更多額度或減少圖片張數再嘗試。',
          quickReply: this.getReplyItems(),
        },
      ]);
    else if (event.postback.data === 'q-4')
      await this.client.replyMessage(event.replyToken, [
        {
          type: 'template',
          altText: '原理介紹',
          template: {
            type: 'buttons',
            text: '請選擇項目',
            actions: [
              {
                type: 'postback',
                displayText: 'LINE 機器人運作介紹',
                label: 'LINE 機器人運作介紹',
                data: 'q-4-1',
              },
              {
                type: 'postback',
                displayText: 'AI 修復原理介紹',
                label: 'AI 修復原理介紹',
                data: 'q-4-2',
              },
            ],
          },
          quickReply: this.getReplyItems(),
        },
      ]);
    else if (event.postback.data === 'q-4-1')
      await this.client.replyMessage(event.replyToken, [
        {
          type: 'text',
          text: '此 LINE 機器人的開發模式與一般的機器人不同，我們使用 AWS Lambda 來實現「無伺服器 (Serverless)」的開發框架。當有人互動時才觸發，並在無人使用時關閉，減少資源浪費，用最有效率的方式為大家服務。',
        },
        {
          type: 'text',
          text: '瞭解更多關於「Serverless」：https://blossom-route-535.notion.site/AWS-Serverless-Instruction-3605caed35104a0f9775dfab65660298',
          quickReply: this.getReplyItems(),
        },
      ]);
    else if (event.postback.data === 'q-4-2')
      await this.client.replyMessage(event.replyToken, [
        {
          type: 'text',
          text: '基於神經網絡的機器學習方法，從大量的照片數據中自動學習和提取複雜的特徵表示。',
        },
        {
          type: 'text',
          text: '瞭解更多關於「CodeFormer」：https://shangchenzhou.com/projects/CodeFormer/',
          quickReply: this.getReplyItems(),
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
            quickReply: this.getReplyItems(),
          },
        ]);
      else
        await this.client.replyMessage(event.replyToken, [
          {
            type: 'template',
            altText: '聯繫管理員',
            template: {
              type: 'buttons',
              text: '請點擊下方按鈕以聯繫管理員',
              actions: [
                {
                  type: 'uri',
                  label: '聯繫管理員',
                  uri: 'https://lin.ee/WSkDSDF',
                },
              ],
            },
            quickReply: this.getReplyItems(),
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
            quickReply: this.getReplyItems(),
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
        Expires: 86400,
      });

      const replicateResponse = await axios.request<ReplicateResponse>({
        data: {
          version:
            '7de2ea26c616d5bf2245ad0d5e24f0ff9a6204578a5c876db53142edd9d2cd56',
          input: {
            image: url,
            codeformer_fidelity: user.codeformerFidelity,
            background_enhance: user.backgroundEnhance,
            face_upsample: user.faceUpsample,
            upscale: user.upscale,
          },
          webhook: `https://airepair${
            process.env.ENVR === 'prod' ? '' : `-${process.env.ENVR}`
          }.celestialstudio.net/api/predict?imageId=${newImage.id}&fileExt=${
            fileType?.ext
          }&replyToken=${event.replyToken}`,
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

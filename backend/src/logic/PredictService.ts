import { Client } from '@line/bot-sdk';
import { Lambda, S3 } from 'aws-sdk';
import axios from 'axios';
import { inject, injectable } from 'inversify';
import { DbAccess } from 'src/access/DbAccess';
import { ImageAccess } from 'src/access/ImageAccess';
import { UserAccess } from 'src/access/UserAccess';
import { ViewUserAccess } from 'src/access/ViewUserAccess';
import { PRE_QUOTA } from 'src/constant/Quota';
import {
  PostPredictProcessRequest,
  PostPredictRequest,
} from 'src/model/api/Predict';
import { UserEntity } from 'src/model/db/UserEntity';
import { ViewUser } from 'src/model/db/ViewUser';
import { BadRequestError } from 'src/model/error';
import { bn } from 'src/util/bignumber';
import { getCount } from 'src/util/userCountHelper';
import { ChatService } from './ChatService';

/**
 * Service class for predict lambda
 */
@injectable()
export class PredictService {
  @inject(DbAccess)
  private readonly dbAccess!: DbAccess;

  @inject(ImageAccess)
  private readonly imageAccess!: ImageAccess;

  @inject(ViewUserAccess)
  private readonly viewUserAccess!: ViewUserAccess;

  @inject(UserAccess)
  private readonly userAccess!: UserAccess;

  @inject(S3)
  private readonly s3!: S3;

  @inject(Lambda)
  private readonly lambda!: Lambda;

  @inject(Client)
  private readonly client!: Client;

  @inject(ChatService)
  private readonly chatService!: ChatService;

  public async cleanup() {
    await this.dbAccess.cleanup();
  }

  private async validateUser(user: ViewUser, count: number) {
    const userCount = getCount(user);
    if (count > userCount) throw new BadRequestError('too many input images');
  }

  public async predictImages(data: PostPredictRequest) {
    const viewUser = await this.viewUserAccess.findById(data.userId);
    await this.validateUser(viewUser, data.images.length);

    const user = new UserEntity();
    user.id = viewUser.id;
    user.name = viewUser.name;
    user.quota = viewUser.quota - 10 * data.images.length;
    await this.userAccess.update(user);

    for (const i of data.images)
      await this.lambda
        .invoke({
          FunctionName: `${process.env.PROJECT}-${process.env.ENVR}-replicate`,
          Payload: JSON.stringify({
            image: i,
            userId: data.userId,
            codeformerFidelity: data.codeformerFidelity,
            backgroundEnhance: data.backgroundEnhance,
            faceUpsample: data.faceUpsample,
            upscale: data.upscale,
          }),
        })
        .promise();
  }

  public async completePredict(
    data: PostPredictProcessRequest,
    imageId: string,
    fileExt: string,
    replyToken: string
  ) {
    console.log(data);
    const predictTime = bn(data.metrics.predict_time).dp(2, 2);

    const image = await this.imageAccess.findById(imageId);
    image.status = data.status;
    image.predictTime = predictTime.toNumber();

    await this.imageAccess.save(image);

    const userId = image.userId;

    if (data.status === 'succeeded') {
      const res = await axios.get(data.output, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(res.data, 'binary');

      const filename = `${userId}/${imageId}.after.${fileExt}`;
      const bucket = `${process.env.PROJECT}-${process.env.ENVR}-predict`;

      await this.s3
        .putObject({
          Body: buffer,
          Bucket: bucket,
          Key: filename,
        })
        .promise();

      const user = await this.userAccess.findById(userId);
      if (user === null) throw new BadRequestError('no user found');

      user.quota = bn(user.quota).plus(PRE_QUOTA).minus(predictTime).toNumber();
      await this.userAccess.update(user);

      await this.client.replyMessage(replyToken, {
        type: 'image',
        originalContentUrl: data.output,
        previewImageUrl: data.output,
        quickReply: { items: this.chatService.getReplyItems() },
      });
    }
  }
}

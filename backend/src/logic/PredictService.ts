import { Client } from '@line/bot-sdk';
import { S3 } from 'aws-sdk';
import axios from 'axios';
import { inject, injectable } from 'inversify';
import { DbAccess } from 'src/access/DbAccess';
import { ImageAccess } from 'src/access/ImageAccess';
import { UserAccess } from 'src/access/UserAccess';
import { PRE_QUOTA } from 'src/constant/Quota';
import { PostPredictProcessRequest } from 'src/model/api/Predict';
import { BadRequestError } from 'src/model/error';
import { bn } from 'src/util/bignumber';
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

  @inject(UserAccess)
  private readonly userAccess!: UserAccess;

  @inject(S3)
  private readonly s3!: S3;

  @inject(Client)
  private readonly client!: Client;

  @inject(ChatService)
  private readonly chatService!: ChatService;

  public async cleanup() {
    await this.dbAccess.cleanup();
  }

  public async completePredict(
    data: PostPredictProcessRequest,
    imageId: string,
    fileExt: string,
    replyToken: string
  ) {
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
        quickReply: this.chatService.getReplyItems(),
      });
    }
  }
}

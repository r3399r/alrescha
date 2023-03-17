import { Lambda, S3 } from 'aws-sdk';
import axios from 'axios';
import { inject, injectable } from 'inversify';
import { DbAccess } from 'src/access/DbAccess';
import { ImageAccess } from 'src/access/ImageAccess';
import { UserAccess } from 'src/access/UserAccess';
import { ViewUserAccess } from 'src/access/ViewUserAccess';
import {
  PostPredictProcessRequest,
  PostPredictRequest,
} from 'src/model/api/Predict';
import { ViewUser } from 'src/model/db/ViewUser';
import { BadRequestError } from 'src/model/error';
import { getCount } from 'src/util/userCountHelper';

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

  public async cleanup() {
    await this.dbAccess.cleanup();
  }

  private async validateUser(user: ViewUser, count: number) {
    const userCount = getCount(user);
    if (count > userCount) throw new BadRequestError('too many input images');
  }

  public async predictImages(data: PostPredictRequest) {
    const user = await this.viewUserAccess.findById(data.userId);
    await this.validateUser(user, data.images.length);

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
    fileExt: string
  ) {
    const res = await axios.get(data.output, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(res.data, 'binary');

    const image = await this.imageAccess.findById(imageId);
    image.status = data.status;
    image.predictTime = data.metrics.predict_time;

    await this.imageAccess.save(image);

    const userId = image.userId;

    const user = await this.userAccess.findById(userId);
    if (user === null) throw new BadRequestError('no user found');

    user.quota = user.quota + 10 - data.metrics.predict_time;
    await this.userAccess.save(user);

    const filename = `${userId}/${imageId}.after.${fileExt}`;
    const bucket = `${process.env.PROJECT}-${process.env.ENVR}-predict`;

    await this.s3
      .putObject({
        Body: buffer,
        Bucket: bucket,
        Key: filename,
      })
      .promise();
  }
}

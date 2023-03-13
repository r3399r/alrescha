import { S3 } from 'aws-sdk';
import axios from 'axios';
import { fileTypeFromBuffer } from 'file-type';
import { inject, injectable } from 'inversify';
import { DbAccess } from 'src/access/DbAccess';
import { ImageAccess } from 'src/access/ImageAccess';
import {
  PostPredictProcessRequest,
  PostPredictRequest,
} from 'src/model/api/Predict';
import { ImageEntity } from 'src/model/ImageEntity';
import { ReplicateResponse } from 'src/model/Replicate';
import { compare } from 'src/util/compare';

/**
 * Service class for
 */
@injectable()
export class PredictService {
  @inject(DbAccess)
  private readonly dbAccess!: DbAccess;

  @inject(ImageAccess)
  private readonly imageAccess!: ImageAccess;

  @inject(S3)
  private readonly s3!: S3;

  public async cleanup() {
    await this.dbAccess.cleanup();
  }

  public async predictImages(data: PostPredictRequest, userId: string) {
    const buffer = Buffer.from(data.image, 'base64');
    const fileType = await fileTypeFromBuffer(buffer);
    try {
      await this.dbAccess.startTransaction();

      const image = new ImageEntity();
      image.userId = userId;
      image.status = 'created';

      const newImage = await this.imageAccess.save(image);

      const filename = `${userId}/${newImage.id}-before.${fileType?.ext}`;
      const bucket = `${process.env.PROJECT}-${process.env.ENVR}-predict`;

      await this.s3
        .putObject({
          Body: buffer,
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
          input: { image: url },
          webhook: `https://airepair${
            process.env.ENVR === 'test' ? '-test' : ''
          }.celestialstudio.net/api/predict/process?userId=${userId}&imageId=${
            newImage.id
          }&fileExt=${fileType?.ext}`,
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

      return replicateResponse;
    } catch (e) {
      await this.dbAccess.rollbackTransaction();
      throw e;
    }
  }

  public async getPredictUrl(userId: string) {
    const bucket = `${process.env.PROJECT}-${process.env.ENVR}-predict`;

    const list = await this.s3.listObjects({ Bucket: bucket }).promise();

    return (list.Contents ?? [])
      .filter((v) => v.Key?.startsWith(userId + '/'))
      .sort(compare('LastModified'))
      .map((v) =>
        this.s3.getSignedUrl('getObject', {
          Bucket: bucket,
          Key: v.Key,
        })
      );
  }

  public async completePredict(
    data: PostPredictProcessRequest,
    userId: string,
    imageId: string,
    fileExt: string
  ) {
    const res = await axios.get(data.output, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(res.data, 'binary');

    const filename = `${userId}/${imageId}-after.${fileExt}`;
    const bucket = `${process.env.PROJECT}-${process.env.ENVR}-predict`;

    await this.s3
      .putObject({
        Body: buffer,
        Bucket: bucket,
        Key: filename,
      })
      .promise();

    const image = await this.imageAccess.findById(imageId);
    image.status = data.status;
    image.predictTime = data.metrics.predict_time;

    await this.imageAccess.save(image);
  }
}

import { S3 } from 'aws-sdk';
import axios from 'axios';
import { fileTypeFromBuffer } from 'file-type';
import { inject, injectable } from 'inversify';
import { DbAccess } from 'src/access/DbAccess';
import { ImageAccess } from 'src/access/ImageAccess';
import { UserAccess } from 'src/access/UserAccess';
import { ImageEntity } from 'src/model/db/ImageEntity';
import { BadRequestError } from 'src/model/error';
import { CustomLambdaEvent } from 'src/model/Lambda';
import { ReplicateResponse } from 'src/model/Replicate';

/**
 * Service class for replicate lambda
 */
@injectable()
export class ReplicateService {
  @inject(DbAccess)
  private readonly dbAccess!: DbAccess;

  @inject(UserAccess)
  private readonly userAccess!: UserAccess;

  @inject(ImageAccess)
  private readonly imageAccess!: ImageAccess;

  @inject(S3)
  private readonly s3!: S3;

  public async cleanup() {
    await this.dbAccess.cleanup();
  }

  public async predictImages(event: CustomLambdaEvent) {
    try {
      await this.dbAccess.startTransaction();

      const user = await this.userAccess.findById(event.userId);
      if (user === null) throw new BadRequestError('no user found');

      user.quota = user.quota - 10;
      await this.userAccess.save(user);

      const buffer = Buffer.from(event.image, 'base64');
      const fileType = await fileTypeFromBuffer(buffer);

      const image = new ImageEntity();
      image.userId = event.userId;
      image.status = 'created';

      const newImage = await this.imageAccess.save(image);

      const filename = `${event.userId}/${newImage.id}-a.${fileType?.ext}`;
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
          input: {
            image: url,
            codeformer_fidelity: event.codeformerFidelity,
            background_enhance: event.backgroundEnhance,
            face_upsample: event.faceUpsample,
            upscale: event.upscale,
          },
          webhook: `https://airepair${
            process.env.ENVR === 'test' ? '-test' : ''
          }.celestialstudio.net/api/predict/process?imageId=${
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
}

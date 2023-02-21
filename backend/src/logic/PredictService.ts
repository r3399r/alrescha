import { S3 } from 'aws-sdk';
import { fileTypeFromBuffer } from 'file-type';
import { inject, injectable } from 'inversify';

/**
 * Service class for
 */
@injectable()
export class PredictService {
  // @inject(DbAccess)
  // private readonly dbAccess!: DbAccess;

  // @inject(Client)
  // private readonly client!: Client;

  @inject(S3)
  private readonly s3!: S3;

  public async cleanup() {
    // await this.dbAccess.cleanup();
  }

  public async receiveImage(data: { image: string }) {
    const buffer = Buffer.from(data.image, 'base64');
    const res = await fileTypeFromBuffer(buffer);

    await this.s3
      .putObject({
        Body: buffer,
        Bucket: 'surveycacke-img',
        Key: `${Date.now()}.${res?.ext}`,
      })
      .promise();
  }
}

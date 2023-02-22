import { S3 } from 'aws-sdk';
import axios from 'axios';
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

  public async predictImages(data: { image: string }) {
    const buffer = Buffer.from(data.image, 'base64');
    const res = await fileTypeFromBuffer(buffer);

    const filename = `predict-${Date.now()}.${res?.ext}`;
    // fs.writeFileSync(`/tmp/${filename}`, buffer);

    await this.s3
      .putObject({
        Body: buffer,
        Bucket: 'surveycacke-img',
        Key: filename,
      })
      .promise();

    const url = this.s3.getSignedUrl('getObject', {
      Bucket: 'surveycacke-img',
      Key: filename,
    });
    console.log(url);
    await axios.request({
      data: {
        version:
          '7de2ea26c616d5bf2245ad0d5e24f0ff9a6204578a5c876db53142edd9d2cd56',
        input: { image: url },
      },
      headers: {
        Authorization: `Token ${process.env.REPLICATE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      url: 'https://api.replicate.com/v1/predictions',
      method: 'post',
    });
    // .then((r) => console.log('res', r))
    // .catch((e) => console.log('error', e));

    console.log('done');
  }

  public async getPredictUrl() {
    const list = await this.s3
      .listObjects({ Bucket: 'surveycacke-img' })
      .promise();
    const files = (list.Contents ?? []).filter((v) =>
      v.Key?.startsWith('predict-')
    );
    const urls = files.map((v) =>
      this.s3.getSignedUrl('getObject', {
        Bucket: 'surveycacke-img',
        Key: v.Key,
      })
    );

    return urls;
  }
}

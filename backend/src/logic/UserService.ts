import { S3 } from 'aws-sdk';
import { inject, injectable } from 'inversify';
import { DbAccess } from 'src/access/DbAccess';
import { ImageAccess } from 'src/access/ImageAccess';
import { ViewUserAccess } from 'src/access/ViewUserAccess';
import {
  GetUserIdPredictResponse,
  GetUserIdResponse,
} from 'src/model/api/User';
import { compare } from 'src/util/compare';
import { getCount } from 'src/util/userCountHelper';

/**
 * Service class for user lambda
 */
@injectable()
export class UserService {
  @inject(DbAccess)
  private readonly dbAccess!: DbAccess;

  @inject(ViewUserAccess)
  private readonly viewUserAccess!: ViewUserAccess;

  @inject(S3)
  private readonly s3!: S3;

  @inject(ImageAccess)
  private readonly imageAccess!: ImageAccess;

  public async cleanup() {
    await this.dbAccess.cleanup();
  }

  public async getUserStatus(userId: string): Promise<GetUserIdResponse> {
    const user = await this.viewUserAccess.findById(userId);

    return {
      quota: user.quota,
      count: getCount(user),
    };
  }

  public async getPredictUrl(
    userId: string
  ): Promise<GetUserIdPredictResponse> {
    const images = await this.imageAccess.findByUserId(userId);

    const bucket = `${process.env.PROJECT}-${process.env.ENVR}-predict`;
    const list = await this.s3.listObjects({ Bucket: bucket }).promise();

    const output =
      list.Contents?.filter((v) => v.Key?.startsWith(userId + '/')).reduce(
        (
          acc: {
            [key: string]: {
              id: string;
              before: string | null;
              after: string | null;
            };
          },
          curr
        ) => {
          const key = curr.Key ?? '';
          const id = key.split('/')[1].split('.')[0];
          const type = key.split('.')[1] as 'before' | 'after';

          if (!acc[id]) acc[id] = { id, before: null, after: null };

          acc[id][type] = this.s3.getSignedUrl('getObject', {
            Bucket: bucket,
            Key: key,
          });

          return acc;
        },
        {}
      ) ?? {};

    const signedUrl = Object.values(output);

    return signedUrl
      .map((v) => {
        const image = images.find((o) => o.id === v.id);

        return {
          ...v,
          dateCreated: image?.dateCreated ?? null,
          dateUpdated: image?.dateUpdated ?? null,
        };
      })
      .sort(compare('dateCreated', 'desc'));
  }
}

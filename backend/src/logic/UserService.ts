import { Client } from '@line/bot-sdk';
import { S3 } from 'aws-sdk';
import { inject, injectable } from 'inversify';
import { DbAccess } from 'src/access/DbAccess';
import { ImageAccess } from 'src/access/ImageAccess';
import { UserAccess } from 'src/access/UserAccess';
import { ViewUserAccess } from 'src/access/ViewUserAccess';
import {
  GetUserIdPredictResponse,
  GetUserIdResponse,
  GetUserResponse,
  PutUserIdQuotaRequest,
  PutUserIdRequest,
} from 'src/model/api/User';
import { BadRequestError } from 'src/model/error';
import { bn } from 'src/util/bignumber';
import { compare } from 'src/util/compare';

/**
 * Service class for user lambda
 */
@injectable()
export class UserService {
  @inject(DbAccess)
  private readonly dbAccess!: DbAccess;

  @inject(UserAccess)
  private readonly userAccess!: UserAccess;

  @inject(ViewUserAccess)
  private readonly viewUserAccess!: ViewUserAccess;

  @inject(S3)
  private readonly s3!: S3;

  @inject(ImageAccess)
  private readonly imageAccess!: ImageAccess;

  @inject(Client)
  private readonly client!: Client;

  public async cleanup() {
    await this.dbAccess.cleanup();
  }

  public async getUsers(): Promise<GetUserResponse> {
    const userList = await this.viewUserAccess.findAll();

    return await Promise.all(
      userList.map(async (v) => {
        const profile = await this.client.getProfile(v.id);

        return { ...v, pictureUrl: profile.pictureUrl ?? null };
      })
    );
  }

  public async getUserStatus(userId: string): Promise<GetUserIdResponse> {
    return await this.viewUserAccess.findById(userId);
  }

  public async updateUserSetting(userId: string, data: PutUserIdRequest) {
    const user = await this.userAccess.findById(userId);
    if (user === null) throw new BadRequestError('no user found');

    user.codeformerFidelity = data.codeformerFidelity;
    user.backgroundEnhance = data.backgroundEnhance;
    user.faceUpsample = data.faceUpsample;
    user.upscale = data.upscale;
    await this.userAccess.update(user);
  }

  public async addUserQuota(userId: string, data: PutUserIdQuotaRequest) {
    if (data.code !== process.env.CODE) throw new BadRequestError('wrong code');

    const user = await this.userAccess.findById(userId);
    if (user === null) throw new BadRequestError('no user found');

    user.quota = bn(user.quota).plus(data.addQuota).toNumber();
    await this.userAccess.update(user);

    return user;
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

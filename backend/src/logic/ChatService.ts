import { Client, FollowEvent, PostbackEvent } from '@line/bot-sdk';
import { inject, injectable } from 'inversify';
import { DbAccess } from 'src/access/DbAccess';
import { UserAccess } from 'src/access/UserAccess';
import { UserEntity } from 'src/model/db/UserEntity';

/**
 * Service class for chat
 */
@injectable()
export class ChatService {
  @inject(DbAccess)
  private readonly dbAccess!: DbAccess;

  @inject(UserAccess)
  private readonly userAccess!: UserAccess;

  @inject(Client)
  private readonly client!: Client;

  public async cleanup() {
    await this.dbAccess.cleanup();
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

      await this.userAccess.save(user);

      await this.client.replyMessage(event.replyToken, [
        {
          type: 'text',
          text: '你好！我是 AI 照片修復師，上傳模糊的舊照片，我幫你把它變高清！',
        },
        {
          type: 'image',
          previewImageUrl:
            'https://yue-public-bucket.s3.ap-southeast-1.amazonaws.com/replicate.jpg',
          originalContentUrl:
            'https://yue-public-bucket.s3.ap-southeast-1.amazonaws.com/replicate.jpg',
        },
        {
          type: 'text',
          text: '100 秒的免費運算時數已送給您，請隨意使用！',
        },
      ]);
    } catch (e) {
      await this.dbAccess.rollbackTransaction();
      throw e;
    }
  }

  public async postback(event: PostbackEvent) {
    await this.client.replyMessage(event.replyToken, [
      {
        type: 'text',
        text: '這是常見問題的回覆',
      },
    ]);
  }
}

import { Client, PostbackEvent } from '@line/bot-sdk';
import { inject, injectable } from 'inversify';
import { DbAccess } from 'src/access/DbAccess';
import { ImageAccess } from 'src/access/ImageAccess';

/**
 * Service class for chat
 */
@injectable()
export class ChatService {
  @inject(DbAccess)
  private readonly dbAccess!: DbAccess;

  @inject(ImageAccess)
  private readonly imageAccess!: ImageAccess;

  @inject(Client)
  private readonly client!: Client;

  public async cleanup() {
    await this.dbAccess.cleanup();
  }

  public async postbackReply(event: PostbackEvent) {
    if (event.source.userId === undefined) return;
    const images = await this.imageAccess.findByUserId(event.source.userId);

    await this.client.replyMessage(event.replyToken, [
      {
        type: 'text',
        text: images.map((v) => `${v.id}: ${v.status}`).join('\n\n'),
      },
    ]);
  }
}

import { Client, MessageEvent } from '@line/bot-sdk';
import { inject, injectable } from 'inversify';

/**
 * Service class for chat
 */
@injectable()
export class ChatService {
  // @inject(DbAccess)
  // private readonly dbAccess!: DbAccess;

  @inject(Client)
  private readonly client!: Client;

  public async cleanup() {
    // await this.dbAccess.cleanup();
  }

  public async replyMessage(event: MessageEvent) {
    await this.client.replyMessage(event.replyToken, [
      {
        type: 'text',
        text: 'hello2!',
      },
    ]);
  }
}

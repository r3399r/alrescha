import { WebhookRequestBody } from '@line/bot-sdk';
import { bindings } from 'src/bindings';
import { ChatService } from 'src/logic/ChatService';
import { BadRequestError } from 'src/model/error';
import { LambdaContext, LambdaEvent } from 'src/model/Lambda';
import { BindingsHelper } from 'src/util/BindingsHelper';

export async function chat(event: LambdaEvent, _context?: LambdaContext) {
  let service: ChatService | null = null;
  try {
    BindingsHelper.bindClientConfig({
      channelAccessToken: String(process.env.CHANNEL_TOKEN),
    });
    service = bindings.get(ChatService);

    if (event.body === null)
      throw new BadRequestError('body should not be empty');

    const body = JSON.parse(event.body) as WebhookRequestBody;

    for (const ev of body.events) {
      if (ev.type === 'message') await service.message(ev);
      if (ev.type === 'postback') await service.postback(ev);
      if (ev.type === 'follow') await service.follow(ev);
    }
  } catch (e) {
    console.error(e);
  } finally {
    await service?.cleanup();
  }
}

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
      channelSecret: String(process.env.CHANNEL_SECRET),
    });
    console.log(event);
    service = bindings.get(ChatService);

    if (event.body === null)
      throw new BadRequestError('body should not be empty');

    const ev = JSON.parse(event.body) as WebhookRequestBody;

    if (ev.events[0].type === 'postback')
      await service.postbackReply(ev.events[0]);
  } catch (e) {
    console.error(e);
  } finally {
    await service?.cleanup();
  }
}

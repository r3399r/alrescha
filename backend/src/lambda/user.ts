import { bindings } from 'src/bindings';
import { UserService } from 'src/logic/UserService';
import { BadRequestError, InternalServerError } from 'src/model/error';
import { LambdaContext, LambdaEvent, LambdaOutput } from 'src/model/Lambda';
import { BindingsHelper } from 'src/util/BindingsHelper';
import { errorOutput, successOutput } from 'src/util/outputHelper';

export async function user(
  event: LambdaEvent,
  _context?: LambdaContext
): Promise<LambdaOutput> {
  console.log(event);

  let service: UserService | null = null;

  BindingsHelper.bindClientConfig({
    channelAccessToken: String(process.env.CHANNEL_TOKEN),
    channelSecret: String(process.env.CHANNEL_SECRET),
  });
  try {
    service = bindings.get(UserService);

    let res: unknown;

    switch (event.resource) {
      case '/api/user/{id}':
        res = await apiUserId(event, service);
        break;
      default:
        throw new InternalServerError('unknown resource');
    }

    return successOutput(res);
  } catch (e) {
    console.error(e);

    return errorOutput(e);
  } finally {
    await service?.cleanup();
  }
}

async function apiUserId(event: LambdaEvent, service: UserService) {
  switch (event.httpMethod) {
    case 'GET':
      if (event.pathParameters === null)
        throw new BadRequestError('pathParameters should not be empty');

      return service.getUserStatus(event.pathParameters.userId);
    default:
      throw new InternalServerError('unknown http method');
  }
}

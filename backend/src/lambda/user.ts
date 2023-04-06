import { bindings } from 'src/bindings';
import { UserService } from 'src/logic/UserService';
import { PutUserIdRequest } from 'src/model/api/User';
import { BadRequestError, InternalServerError } from 'src/model/error';
import { LambdaContext, LambdaEvent, LambdaOutput } from 'src/model/Lambda';
import { BindingsHelper } from 'src/util/BindingsHelper';
import { errorOutput, successOutput } from 'src/util/outputHelper';

export async function user(
  event: LambdaEvent,
  _context?: LambdaContext
): Promise<LambdaOutput> {
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
      case '/api/user/{id}/predict':
        res = await apiUserIdPredict(event, service);
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

      return service.getUserStatus(event.pathParameters.id);
    case 'PUT':
      if (event.pathParameters === null)
        throw new BadRequestError('pathParameters should not be empty');
      if (event.body === null)
        throw new BadRequestError('body should not be empty');

      return service.updateUserSetting(
        event.pathParameters.id,
        JSON.parse(event.body) as PutUserIdRequest
      );
    default:
      throw new InternalServerError('unknown http method');
  }
}

async function apiUserIdPredict(event: LambdaEvent, service: UserService) {
  switch (event.httpMethod) {
    case 'GET':
      if (event.pathParameters === null)
        throw new BadRequestError('pathParameters should not be empty');

      return service.getPredictUrl(event.pathParameters.id);
    default:
      throw new InternalServerError('unknown http method');
  }
}

import { bindings } from 'src/bindings';
import { PredictService } from 'src/logic/PredictService';
import {
  PostPredictProcessRequest,
  PostPredictRequest,
} from 'src/model/api/Predict';
import { BadRequestError, InternalServerError } from 'src/model/error';
import { LambdaContext, LambdaEvent, LambdaOutput } from 'src/model/Lambda';
import { BindingsHelper } from 'src/util/BindingsHelper';
import { errorOutput, successOutput } from 'src/util/outputHelper';

export async function predict(
  event: LambdaEvent,
  _context?: LambdaContext
): Promise<LambdaOutput> {
  console.log(event);

  let service: PredictService | null = null;

  BindingsHelper.bindClientConfig({
    channelAccessToken: String(process.env.CHANNEL_TOKEN),
    channelSecret: String(process.env.CHANNEL_SECRET),
  });
  try {
    service = bindings.get(PredictService);

    let res: unknown;

    switch (event.resource) {
      case '/api/predict':
        res = await apiPredict(event, service);
        break;
      case '/api/predict/process':
        res = await apiPredictProcess(event, service);
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

async function apiPredict(event: LambdaEvent, service: PredictService) {
  if (event.queryStringParameters === null)
    throw new BadRequestError('queryStringParameters should not be empty');
  switch (event.httpMethod) {
    case 'GET':
      return service.getPredictUrl(event.queryStringParameters.userId);
    case 'POST':
      if (event.body === null)
        throw new BadRequestError('body should not be empty');

      return service.predictImages(
        JSON.parse(event.body) as PostPredictRequest,
        event.queryStringParameters.userId
      );
    default:
      throw new InternalServerError('unknown http method');
  }
}

async function apiPredictProcess(event: LambdaEvent, service: PredictService) {
  if (event.queryStringParameters === null)
    throw new BadRequestError('queryStringParameters should not be empty');
  switch (event.httpMethod) {
    case 'POST':
      if (event.body === null)
        throw new BadRequestError('body should not be empty');

      return service.completePredict(
        JSON.parse(event.body) as PostPredictProcessRequest,
        event.queryStringParameters.imageId,
        event.queryStringParameters.fileExt
      );
    default:
      throw new InternalServerError('unknown http method');
  }
}

import { bindings } from 'src/bindings';
import {
  BadRequestError,
  InternalServerError,
} from 'src/celestial-service/error';
import { errorOutput, successOutput } from 'src/celestial-service/LambdaOutput';
import {
  LambdaContext,
  LambdaEvent,
  LambdaOutput,
} from 'src/celestial-service/model/Lambda';
import { PredictService } from 'src/logic/PredictService';

export async function predict(
  event: LambdaEvent,
  _context?: LambdaContext
): Promise<LambdaOutput> {
  let service: PredictService | null = null;

  console.log(event);
  try {
    service = bindings.get(PredictService);

    let res: unknown;

    switch (event.resource) {
      case '/api/predict':
        res = await apiPredict(event, service);
        break;
      default:
        throw new InternalServerError('unknown resource');
    }

    return successOutput(res);
  } catch (e) {
    return errorOutput(e);
  } finally {
    await service?.cleanup();
  }
}

async function apiPredict(event: LambdaEvent, service: PredictService) {
  if (event.headers === null)
    throw new BadRequestError('headers should not be empty');
  switch (event.httpMethod) {
    case 'GET':
      return service.getPredictUrl();
    case 'POST':
      if (event.body === null)
        throw new BadRequestError('body should not be empty');

      return service.predictImages(JSON.parse(event.body) as { image: string });
    default:
      throw new InternalServerError('unknown http method');
  }
}

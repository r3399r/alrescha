import { bindings } from 'src/bindings';
import { ReplicateService } from 'src/logic/ReplicateService';
import { CustomLambdaEvent, LambdaContext } from 'src/model/Lambda';

export async function replicate(
  event: CustomLambdaEvent,
  _context?: LambdaContext
) {
  let service: ReplicateService | null = null;
  try {
    service = bindings.get(ReplicateService);
    await service.predictImages(event);
  } catch (e) {
    console.error(e);
  } finally {
    await service?.cleanup();
  }
}

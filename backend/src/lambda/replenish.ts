import { bindings } from 'src/bindings';
import { ReplenishService } from 'src/logic/ReplenishService';

export async function replenish(_event: unknown, _context: unknown) {
  let service: ReplenishService | null = null;
  try {
    service = bindings.get(ReplenishService);
    await service.doReplenish();
  } finally {
    await service?.cleanup();
  }
}

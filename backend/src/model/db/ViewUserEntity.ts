import { ViewColumn, ViewEntity } from 'typeorm';
import { ViewUser } from './ViewUser';

@ViewEntity({ name: 'v_user' })
export class ViewUserEntity implements ViewUser {
  @ViewColumn()
  id!: string;

  @ViewColumn()
  name!: string;

  @ViewColumn()
  quota!: number;

  @ViewColumn({ name: 'codeformer_fidelity' })
  codeformerFidelity!: number;

  @ViewColumn({ name: 'background_enhance' })
  backgroundEnhance!: boolean;

  @ViewColumn({ name: 'face_upsample' })
  faceUpsample!: boolean;

  @ViewColumn()
  upscale!: number;

  @ViewColumn()
  avg: number | null = null;

  @ViewColumn()
  count: number | null = null;
}

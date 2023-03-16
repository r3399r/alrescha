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

  @ViewColumn()
  avg: number | null = null;

  @ViewColumn()
  count!: number;
}

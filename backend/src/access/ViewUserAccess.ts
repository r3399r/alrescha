import { inject, injectable } from 'inversify';
import { ViewUser } from 'src/model/db/ViewUser';
import { ViewUserEntity } from 'src/model/db/ViewUserEntity';
import { Database } from 'src/util/Database';

/**
 * Access class for ViewUser model.
 */
@injectable()
export class ViewUserAccess {
  @inject(Database)
  private readonly database!: Database;

  public async findAll() {
    const qr = await this.database.getQueryRunner();

    return await qr.manager.find<ViewUser>(ViewUserEntity.name, {
      order: { lastDateUpdated: 'desc' },
    });
  }

  public async findById(id: string) {
    const qr = await this.database.getQueryRunner();

    return await qr.manager.findOneByOrFail<ViewUser>(ViewUserEntity.name, {
      id,
    });
  }
}

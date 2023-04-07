import { inject, injectable } from 'inversify';
import { DbAccess } from 'src/access/DbAccess';
import { UserAccess } from 'src/access/UserAccess';
import { bn } from 'src/util/bignumber';

/**
 * Service class for replenish
 */
@injectable()
export class ReplenishService {
  @inject(DbAccess)
  private readonly dbAccess!: DbAccess;

  @inject(UserAccess)
  private readonly userAccess!: UserAccess;

  public async cleanup() {
    await this.dbAccess.cleanup();
  }

  public async doReplenish() {
    try {
      await this.dbAccess.startTransaction();
      const userList = await this.userAccess.findAll();

      for (const user of userList)
        if (user.quota < 20) {
          if (user.quota >= 0) user.quota = 20;
          else if (user.quota < 0)
            user.quota = bn(user.quota).plus(20).toNumber();

          await this.userAccess.update(user);
        }

      await this.dbAccess.commitTransaction();
    } catch (e) {
      await this.dbAccess.rollbackTransaction();
      throw e;
    }
  }
}

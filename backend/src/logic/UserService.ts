import { inject, injectable } from 'inversify';
import { DbAccess } from 'src/access/DbAccess';
import { ViewUserAccess } from 'src/access/ViewUserAccess';
import { GetUserIdResponse } from 'src/model/api/User';
import { getCount } from 'src/util/userCountHelper';

/**
 * Service class for user lambda
 */
@injectable()
export class UserService {
  @inject(DbAccess)
  private readonly dbAccess!: DbAccess;

  @inject(ViewUserAccess)
  private readonly viewUserAccess!: ViewUserAccess;

  public async cleanup() {
    await this.dbAccess.cleanup();
  }

  public async getUserStatus(userId: string): Promise<GetUserIdResponse> {
    const user = await this.viewUserAccess.findById(userId);

    return {
      quota: user.quota,
      count: getCount(user),
    };
  }
}

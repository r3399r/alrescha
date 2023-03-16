import { inject, injectable } from 'inversify';
import { User } from 'src/model/db/User';
import { UserEntity } from 'src/model/db/UserEntity';
import { BadRequestError } from 'src/model/error';
import { Database } from 'src/util/Database';

/**
 * Access class for User model.
 */
@injectable()
export class UserAccess {
  @inject(Database)
  private readonly database!: Database;

  public async save(input: User) {
    const qr = await this.database.getQueryRunner();
    const entity = new UserEntity();
    Object.assign(entity, input);

    return await qr.manager.save(entity);
  }

  public async update(input: User) {
    const qr = await this.database.getQueryRunner();
    const entity = new UserEntity();
    Object.assign(entity, input);

    const res = await qr.manager.update(UserEntity, { id: input.id }, entity);

    if (res.affected === 0) throw new BadRequestError('nothing happened.');
  }

  public async findById(id: string) {
    const qr = await this.database.getQueryRunner();

    return await qr.manager.findOneBy<User>(UserEntity.name, {
      id,
    });
  }
}

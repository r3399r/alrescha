import { inject, injectable } from 'inversify';
import { Image } from 'src/model/db/Image';
import { ImageEntity } from 'src/model/db/ImageEntity';
import { BadRequestError } from 'src/model/error';
import { Database } from 'src/util/Database';

/**
 * Access class for Image model.
 */
@injectable()
export class ImageAccess {
  @inject(Database)
  private readonly database!: Database;

  public async save(input: Image) {
    const qr = await this.database.getQueryRunner();
    const entity = new ImageEntity();
    Object.assign(entity, input);

    return await qr.manager.save(entity);
  }

  public async update(input: Image) {
    const qr = await this.database.getQueryRunner();
    const entity = new ImageEntity();
    Object.assign(entity, input);

    const res = await qr.manager.update(ImageEntity, { id: input.id }, entity);

    if (res.affected === 0) throw new BadRequestError('nothing happened.');
  }

  public async findById(id: string) {
    const qr = await this.database.getQueryRunner();

    return await qr.manager.findOneByOrFail<Image>(ImageEntity.name, {
      id,
    });
  }

  public async findByUserId(userId: string) {
    const qr = await this.database.getQueryRunner();

    return await qr.manager.findBy<Image>(ImageEntity.name, {
      userId,
    });
  }
}

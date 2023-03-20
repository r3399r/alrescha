import { BeforeInsert, BeforeUpdate, Column, Entity, Generated } from 'typeorm';
import { Image } from './Image';

@Entity({ name: 'image' })
export class ImageEntity implements Image {
  @Column({ primary: true })
  @Generated('uuid')
  id!: string;

  @Column({ type: 'text', name: 'user_id' })
  userId!: string;

  @Column({ type: 'text' })
  status!: string;

  @Column({ type: 'text', name: 'predict_id', default: null })
  predictId: string | null = null;

  @Column({ type: 'float', name: 'predict_time', default: null })
  predictTime: number | null = null;

  @Column({ type: 'timestamp', name: 'date_created', default: null })
  dateCreated!: string;

  @Column({ type: 'timestamp', name: 'date_updated', default: null })
  dateUpdated: string | null = null;

  @BeforeInsert()
  setDateCreated(): void {
    this.dateCreated = new Date().toISOString();
  }

  @BeforeUpdate()
  setDateUpdated(): void {
    this.dateUpdated = new Date().toISOString();
  }
}

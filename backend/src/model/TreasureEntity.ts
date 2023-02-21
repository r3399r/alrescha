import { BeforeInsert, BeforeUpdate, Column, Entity, Generated } from 'typeorm';
import { Treasure } from './Treasure';

@Entity({ name: 'treasure' })
export class TreasureEntity implements Treasure {
  @Column({ primary: true })
  @Generated('uuid')
  id!: string;

  @Column({ type: 'text', name: 'user_id' })
  userId!: string;

  @Column({ type: 'text', name: 'display_name' })
  displayName!: string;

  @Column({ type: 'float' })
  stage!: number;

  @Column({ type: 'text' })
  status!: string;

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

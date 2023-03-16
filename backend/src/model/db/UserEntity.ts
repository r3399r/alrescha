import { BeforeInsert, BeforeUpdate, Column, Entity } from 'typeorm';
import { User } from './User';

@Entity({ name: 'user' })
export class UserEntity implements User {
  @Column({ primary: true })
  id!: string;

  @Column({ type: 'text' })
  name!: string;

  @Column({ type: 'float' })
  quota!: number;

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

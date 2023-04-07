import { BeforeInsert, BeforeUpdate, Column, Entity, Generated } from 'typeorm';
import { User } from './User';

@Entity({ name: 'user' })
export class UserEntity implements User {
  @Column({ primary: true })
  @Generated('uuid')
  id!: string;

  @Column({ type: 'text' })
  name!: string;

  @Column({ type: 'float' })
  quota!: number;

  @Column({ type: 'float', name: 'codeformer_fidelity' })
  codeformerFidelity!: number;

  @Column({ type: 'boolean', name: 'background_enhance' })
  backgroundEnhance!: boolean;

  @Column({ type: 'boolean', name: 'face_upsample' })
  faceUpsample!: boolean;

  @Column({ type: 'float' })
  upscale!: number;

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

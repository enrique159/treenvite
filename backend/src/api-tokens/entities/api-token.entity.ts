import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiTokenPermission } from '../../common/domain.enums';
import { Event } from '../../events/entities/event.entity';
import { User } from '../../users/entities/user.entity';

@Entity('api_tokens')
@Index(['eventId', 'createdAt'])
export class ApiToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  eventId: string;

  @ManyToOne(() => Event, { onDelete: 'CASCADE' })
  event: Event;

  @Column({ length: 100 })
  name: string;

  @Index({ unique: true })
  @Column({ length: 64, select: false })
  tokenHash: string;

  @Column({ length: 4 })
  tokenSuffix: string;

  @Column({ type: 'varchar', length: 20 })
  permission: ApiTokenPermission;

  @Column({ type: 'datetime', precision: 6, nullable: true })
  expiresAt: Date | null;

  @Column({ type: 'datetime', precision: 6, nullable: true })
  revokedAt: Date | null;

  @Column({ type: 'datetime', precision: 6, nullable: true })
  lastUsedAt: Date | null;

  @Column()
  createdById: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  createdBy: User;

  @CreateDateColumn({ type: 'datetime', precision: 6 })
  createdAt: Date;
}

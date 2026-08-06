import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EventRole } from '../../common/domain.enums';
import { Event } from '../../events/entities/event.entity';
import { User } from '../../users/entities/user.entity';
import { EventAccessCode } from './event-access-code.entity';

@Entity('event_access_grants')
@Index(['accessCodeId', 'userId'], { unique: true })
export class EventAccessGrant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  eventId: string;

  @ManyToOne(() => Event, { onDelete: 'CASCADE' })
  event: Event;

  @Column()
  accessCodeId: string;

  @ManyToOne(() => EventAccessCode, (code) => code.grants, {
    onDelete: 'CASCADE',
  })
  accessCode: EventAccessCode;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'varchar', length: 20 })
  role: EventRole;

  @Column({ type: 'datetime', precision: 6 })
  expiresAt: Date;

  @CreateDateColumn({ type: 'datetime', precision: 6 })
  createdAt: Date;
}

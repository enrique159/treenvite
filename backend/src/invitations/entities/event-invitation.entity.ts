import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EventRole, InvitationStatus } from '../../common/domain.enums';
import { Event } from '../../events/entities/event.entity';
import { User } from '../../users/entities/user.entity';

@Entity('event_invitations')
export class EventInvitation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  eventId: string;

  @ManyToOne(() => Event, (event) => event.invitations, { onDelete: 'CASCADE' })
  event: Event;

  @Index()
  @Column({ length: 190 })
  email: string;

  @Column({ type: 'varchar', length: 20 })
  role: EventRole;

  @Column({ type: 'varchar', length: 20, default: InvitationStatus.PENDING })
  status: InvitationStatus;

  @Index({ unique: true })
  @Column({ length: 64, select: false })
  tokenHash: string;

  @Column({ type: 'datetime', precision: 6 })
  expiresAt: Date;

  @Column({ type: 'datetime', precision: 6, nullable: true })
  acceptedAt: Date | null;

  @Column()
  invitedById: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  invitedBy: User;

  @CreateDateColumn({ type: 'datetime', precision: 6 })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', precision: 6 })
  updatedAt: Date;
}

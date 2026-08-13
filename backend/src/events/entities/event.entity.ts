import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { EventStatus } from '../../common/domain.enums';
import { EventAccessCode } from '../../access-codes/entities/event-access-code.entity';
import { EventInvitation } from '../../invitations/entities/event-invitation.entity';
import { EventMember } from '../../members/entities/event-member.entity';
import { Guest } from '../../guests/entities/guest.entity';
import { RelationSuggestion } from '../../guests/entities/relation-suggestion.entity';
import { User } from '../../users/entities/user.entity';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  ownerId: string;

  @ManyToOne(() => User, (user) => user.ownedEvents, { onDelete: 'RESTRICT' })
  owner: User;

  @Column({ length: 160 })
  name: string;

  @Column({ length: 60 })
  type: string;

  @Column({ type: 'datetime', precision: 6 })
  startsAt: Date;

  @Column({ length: 255 })
  location: string;

  @Column({ type: 'varchar', length: 20, default: EventStatus.DRAFT })
  status: EventStatus;

  @Column({ length: 20, default: '#e96f51' })
  color: string;

  @OneToMany(() => EventMember, (member) => member.event)
  members: EventMember[];

  @OneToMany(() => EventInvitation, (invitation) => invitation.event)
  invitations: EventInvitation[];

  @OneToMany(() => EventAccessCode, (code) => code.event)
  accessCodes: EventAccessCode[];

  @OneToMany(() => Guest, (guest) => guest.event)
  guests: Guest[];

  @OneToMany(() => RelationSuggestion, (suggestion) => suggestion.event)
  relationSuggestions: RelationSuggestion[];

  @VersionColumn()
  version: number;

  @CreateDateColumn({ type: 'datetime', precision: 6 })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', precision: 6 })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'datetime', precision: 6, nullable: true })
  deletedAt: Date | null;
}

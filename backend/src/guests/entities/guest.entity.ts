import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { RsvpStatus } from '../../common/domain.enums';
import { Event } from '../../events/entities/event.entity';

@Entity('guests')
@Index(['eventId', 'parentId'])
export class Guest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  eventId: string;

  @ManyToOne(() => Event, (event) => event.guests, { onDelete: 'CASCADE' })
  event: Event;

  @Column({ nullable: true })
  parentId: string | null;

  @ManyToOne(() => Guest, (guest) => guest.children, { nullable: true, onDelete: 'RESTRICT' })
  parent: Guest | null;

  @OneToMany(() => Guest, (guest) => guest.parent)
  children: Guest[];

  @Index()
  @Column({ length: 160 })
  name: string;

  @Column({ length: 190, nullable: true })
  email: string | null;

  @Column({ length: 40, nullable: true })
  phone: string | null;

  @Index()
  @Column({ length: 100, default: 'Sin grupo' })
  groupName: string;

  @Column({ length: 80, default: 'Invitado' })
  relationLabel: string;

  @Index()
  @Column({ type: 'varchar', length: 20, default: RsvpStatus.PENDING })
  rsvp: RsvpStatus;

  @Column({ type: 'int', unsigned: true, default: 0 })
  companions: number;

  @Column({ type: 'text', nullable: true })
  dietary: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @VersionColumn()
  version: number;

  @CreateDateColumn({ type: 'datetime', precision: 6 })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', precision: 6 })
  updatedAt: Date;
}

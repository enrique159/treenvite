import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Event } from '../../events/entities/event.entity';

@Entity('guest_relation_suggestions')
@Index(['scopeKey', 'normalizedLabel'], { unique: true })
export class RelationSuggestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36, nullable: true })
  eventId: string | null;

  @ManyToOne(() => Event, (event) => event.relationSuggestions, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  event: Event | null;

  @Column({ length: 36 })
  scopeKey: string;

  @Column({ length: 80 })
  label: string;

  @Column({ length: 80 })
  normalizedLabel: string;

  @Column({ default: false })
  isDefault: boolean;

  @CreateDateColumn({ type: 'datetime', precision: 6 })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', precision: 6 })
  updatedAt: Date;
}

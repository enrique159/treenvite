import { HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ApiException } from '../common/api-exception';
import { EventRole } from '../common/domain.enums';
import { EventAccessService } from '../events/event-access.service';
import { RelationSuggestion } from './entities/relation-suggestion.entity';
import {
  normalizeRelationLabel,
  relationLabelKey,
} from './relation-label.util';

const DEFAULT_SCOPE = 'default';
const DEFAULT_RELATIONS = [
  'Anfitrión',
  'Pareja',
  'Familiar',
  'Amigo',
  'Amiga',
  'Compañero de trabajo',
  'Compañera de trabajo',
  'Acompañante',
  'Referido',
  'Referida',
  'Invitado',
  'Invitada',
] as const;

@Injectable()
export class RelationSuggestionsService implements OnModuleInit {
  constructor(
    @InjectRepository(RelationSuggestion)
    private readonly suggestions: Repository<RelationSuggestion>,
    private readonly access: EventAccessService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.suggestions.upsert(
      DEFAULT_RELATIONS.map((label) => ({
        eventId: null,
        scopeKey: DEFAULT_SCOPE,
        label,
        normalizedLabel: relationLabelKey(label),
        isDefault: true,
      })),
      {
        conflictPaths: ['scopeKey', 'normalizedLabel'],
        skipUpdateIfNoValuesChanged: true,
      },
    );
  }

  async list(userId: string, eventId: string): Promise<string[]> {
    await this.access.requireRole(eventId, userId, EventRole.VIEWER);
    const suggestions = await this.suggestions.find({
      where: { scopeKey: In([DEFAULT_SCOPE, eventId]) },
      order: { isDefault: 'DESC', label: 'ASC' },
    });
    return suggestions.map((suggestion) => suggestion.label);
  }

  async resolve(eventId: string, value: string): Promise<string> {
    let label: string;
    let normalizedLabel: string;
    try {
      label = normalizeRelationLabel(value);
      normalizedLabel = relationLabelKey(label);
    } catch {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'INVALID_RELATION_LABEL',
        'La relación sólo puede contener letras y espacios',
      );
    }

    const existing = await this.suggestions.findOne({
      where: [
        { scopeKey: DEFAULT_SCOPE, normalizedLabel },
        { scopeKey: eventId, normalizedLabel },
      ],
      order: { isDefault: 'DESC' },
    });
    if (existing) return existing.label;

    try {
      const suggestion = await this.suggestions.save(
        this.suggestions.create({
          eventId,
          scopeKey: eventId,
          label,
          normalizedLabel,
          isDefault: false,
        }),
      );
      return suggestion.label;
    } catch (cause) {
      const concurrent = await this.suggestions.findOne({
        where: { scopeKey: eventId, normalizedLabel },
      });
      if (concurrent) return concurrent.label;
      throw cause;
    }
  }
}

import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventAccessService } from '../events/event-access.service';
import { RelationSuggestion } from './entities/relation-suggestion.entity';
import { RelationSuggestionsService } from './relation-suggestions.service';

describe('RelationSuggestionsService', () => {
  const repository = {
    upsert: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn((value) => Promise.resolve(value)),
    create: jest.fn((value) => value),
  };
  const access = { requireRole: jest.fn().mockResolvedValue('viewer') };
  let service: RelationSuggestionsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        RelationSuggestionsService,
        {
          provide: getRepositoryToken(RelationSuggestion),
          useValue: repository,
        },
        { provide: EventAccessService, useValue: access },
      ],
    }).compile();
    service = module.get(RelationSuggestionsService);
  });

  it('seeds normalized default suggestions idempotently', async () => {
    repository.upsert.mockResolvedValue({});

    await service.onModuleInit();

    expect(repository.upsert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Acompañante',
          normalizedLabel: 'acompanante',
          scopeKey: 'default',
          isDefault: true,
        }),
      ]),
      expect.objectContaining({
        conflictPaths: ['scopeKey', 'normalizedLabel'],
      }),
    );
  });

  it('normalizes and stores a custom suggestion in its event', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(
      service.resolve('event-1', '  AMISTAD   de universidad '),
    ).resolves.toBe('Amistad de universidad');
    expect(repository.create).toHaveBeenCalledWith({
      eventId: 'event-1',
      scopeKey: 'event-1',
      label: 'Amistad de universidad',
      normalizedLabel: 'amistad de universidad',
      isDefault: false,
    });
  });

  it('reuses the canonical default instead of creating a duplicate', async () => {
    repository.findOne.mockResolvedValue({
      label: 'Acompañante',
      normalizedLabel: 'acompanante',
      isDefault: true,
    });

    await expect(service.resolve('event-1', 'ACOMPANANTE')).resolves.toBe(
      'Acompañante',
    );
    expect(repository.save).not.toHaveBeenCalled();
  });
});

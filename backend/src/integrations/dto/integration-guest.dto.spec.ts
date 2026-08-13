import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  IntegrationGuestListQueryDto,
  IntegrationUpdateGuestDto,
} from './integration-guest.dto';

describe('Integration guest DTOs', () => {
  it('applies pagination defaults and normalizes direction', async () => {
    const query = plainToInstance(IntegrationGuestListQueryDto, {
      direction: 'DESC',
    });

    await expect(validate(query)).resolves.toHaveLength(0);
    expect(query).toMatchObject({ page: 1, limit: 50, direction: 'desc' });
  });

  it('rejects unsupported sorting and oversized pages', async () => {
    const query = plainToInstance(IntegrationGuestListQueryDto, {
      sort: 'notes',
      limit: 201,
    });

    const errors = await validate(query);
    expect(errors.map((error) => error.property)).toEqual(
      expect.arrayContaining(['sort', 'limit']),
    );
  });

  it('requires a version for updates and accepts null on nullable fields', async () => {
    const missingVersion = plainToInstance(IntegrationUpdateGuestDto, {
      rsvp: 'confirmed',
    });
    const valid = plainToInstance(IntegrationUpdateGuestDto, {
      email: null,
      notes: null,
      version: 2,
    });

    await expect(validate(missingVersion)).resolves.not.toHaveLength(0);
    await expect(validate(valid)).resolves.toHaveLength(0);
  });
});

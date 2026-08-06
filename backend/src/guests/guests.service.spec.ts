import { HttpStatus } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ApiException } from '../common/api-exception';
import { EventAccessService } from '../events/event-access.service';
import { Guest } from './entities/guest.entity';
import { GuestsService } from './guests.service';

describe('GuestsService', () => {
  const repository = {
    findOne: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
    save: jest.fn(),
    create: jest.fn((value) => value),
  };
  const access = { requireRole: jest.fn().mockResolvedValue('editor') };
  let service: GuestsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        GuestsService,
        { provide: getRepositoryToken(Guest), useValue: repository },
        { provide: EventAccessService, useValue: access },
      ],
    }).compile();
    service = module.get(GuestsService);
  });

  it('persists blank contact details as null when creating a guest', async () => {
    await service.create('user-1', 'event-1', {
      name: 'Ana Pérez',
      email: '   ',
      phone: '',
    });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ email: null, phone: null }),
    );
  });

  it('normalizes non-empty contact details when creating a guest', async () => {
    await service.create('user-1', 'event-1', {
      name: 'Ana Pérez',
      email: '  ANA@EXAMPLE.COM  ',
      phone: '  6691234567  ',
    });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'ana@example.com',
        phone: '6691234567',
      }),
    );
  });

  it('persists blank contact details as null when updating a guest', async () => {
    repository.findOne.mockResolvedValueOnce({
      id: 'guest-1',
      eventId: 'event-1',
      email: 'ana@example.com',
      phone: '6691234567',
      version: 1,
    });

    await service.update('user-1', 'event-1', 'guest-1', {
      email: ' ',
      phone: '',
    });

    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({ email: null, phone: null }),
    );
  });

  it('blocks deletion while the guest has children', async () => {
    repository.findOne.mockResolvedValue({ id: 'guest-1', eventId: 'event-1' });
    repository.find.mockResolvedValue([{ id: 'child-1', name: 'Hija' }]);

    await expect(
      service.remove('user-1', 'event-1', 'guest-1'),
    ).rejects.toMatchObject({
      status: HttpStatus.CONFLICT,
    } as Partial<ApiException>);
    expect(repository.remove).not.toHaveBeenCalled();
  });

  it('removes a leaf guest', async () => {
    const guest = { id: 'guest-1', eventId: 'event-1' };
    repository.findOne.mockResolvedValue(guest);
    repository.find.mockResolvedValue([]);

    await expect(
      service.remove('user-1', 'event-1', 'guest-1'),
    ).resolves.toEqual({ message: 'Invitado eliminado' });
    expect(repository.remove).toHaveBeenCalledWith(guest);
  });

  it('rejects a parent that belongs to another event', async () => {
    repository.findOne
      .mockResolvedValueOnce({
        id: 'guest-1',
        eventId: 'event-1',
        parentId: null,
        version: 1,
      })
      .mockResolvedValueOnce(null);

    await expect(
      service.update('user-1', 'event-1', 'guest-1', {
        parentId: 'outside-parent',
      }),
    ).rejects.toMatchObject({
      response: expect.objectContaining({ code: 'PARENT_NOT_IN_EVENT' }),
    });
  });

  it('rejects reparenting below one of its descendants', async () => {
    repository.findOne
      .mockResolvedValueOnce({
        id: 'guest-1',
        eventId: 'event-1',
        parentId: null,
        version: 1,
      })
      .mockResolvedValueOnce({
        id: 'child-1',
        eventId: 'event-1',
        parentId: 'guest-1',
      })
      .mockResolvedValueOnce({
        id: 'guest-1',
        eventId: 'event-1',
        parentId: null,
      });

    await expect(
      service.update('user-1', 'event-1', 'guest-1', { parentId: 'child-1' }),
    ).rejects.toMatchObject({
      response: expect.objectContaining({ code: 'GUEST_TREE_CYCLE' }),
    });
  });
});

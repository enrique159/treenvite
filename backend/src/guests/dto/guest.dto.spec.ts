import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateGuestDto, UpdateGuestDto } from './guest.dto';

describe('Guest contact DTOs', () => {
  it('accepts omitted or blank contact details and normalizes blanks to null', async () => {
    const omitted = plainToInstance(CreateGuestDto, { name: 'Ana Pérez' });
    const blank = plainToInstance(CreateGuestDto, {
      name: 'Ana Pérez',
      email: '   ',
      phone: '',
    });

    await expect(validate(omitted)).resolves.toHaveLength(0);
    await expect(validate(blank)).resolves.toHaveLength(0);
    expect(blank.email).toBeNull();
    expect(blank.phone).toBeNull();
  });

  it('accepts and trims valid non-empty contact details', async () => {
    const dto = plainToInstance(CreateGuestDto, {
      name: 'Ana Pérez',
      email: '  ana@example.com  ',
      phone: '  6691234567  ',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
    expect(dto.email).toBe('ana@example.com');
    expect(dto.phone).toBe('6691234567');
  });

  it.each([
    ['un correo inválido', { email: 'correo-invalido' }, 'email'],
    ['letras en el teléfono', { phone: '669ABC4567' }, 'phone'],
    ['un teléfono demasiado corto', { phone: '123456' }, 'phone'],
    ['un teléfono demasiado largo', { phone: '1234567890123456' }, 'phone'],
  ])('rejects %s', async (_case, contact, property) => {
    const dto = plainToInstance(CreateGuestDto, {
      name: 'Ana Pérez',
      ...contact,
    });

    const errors = await validate(dto);

    expect(errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ property })]),
    );
  });

  it('accepts null contact details when updating a guest', async () => {
    const dto = plainToInstance(UpdateGuestDto, {
      email: null,
      phone: null,
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });
});

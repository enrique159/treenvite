import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiTokenGuard } from '../api-tokens/api-token.guard';
import { ApiTokensService } from '../api-tokens/api-tokens.service';
import { CurrentApiToken } from '../api-tokens/current-api-token.decorator';
import type { ApiTokenPrincipal } from '../api-tokens/current-api-token.decorator';
import { ApiException } from '../common/api-exception';
import { GuestsService } from '../guests/guests.service';
import {
  IntegrationErrorDto,
  IntegrationGuestListQueryDto,
  IntegrationGuestPageDto,
  IntegrationGuestResponseDto,
  IntegrationUpdateGuestDto,
  toIntegrationGuest,
} from './dto/integration-guest.dto';

@ApiTags('Invitados')
@ApiBearerAuth('api-token')
@Controller('integrations/guests')
@UseGuards(ApiTokenGuard)
export class IntegrationsGuestsController {
  constructor(
    private readonly guests: GuestsService,
    private readonly apiTokens: ApiTokensService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Listar invitados',
    description:
      'Devuelve los invitados del evento asociado al token. La paginación usa `page` y `limit`.',
  })
  @ApiOkResponse({ type: IntegrationGuestPageDto })
  @ApiResponse({
    status: 400,
    type: IntegrationErrorDto,
    description: 'Parámetros inválidos.',
  })
  @ApiResponse({
    status: 401,
    type: IntegrationErrorDto,
    description: 'Token inválido, vencido o revocado.',
  })
  @ApiResponse({
    status: 429,
    type: IntegrationErrorDto,
    description: 'Límite de solicitudes excedido.',
  })
  async list(
    @CurrentApiToken() token: ApiTokenPrincipal,
    @Query() query: IntegrationGuestListQueryDto,
  ): Promise<IntegrationGuestPageDto> {
    const page = await this.guests.listForEvent(token.eventId, query);
    return { ...page, items: page.items.map(toIntegrationGuest) };
  }

  @Get(':guestId')
  @ApiOperation({ summary: 'Consultar un invitado' })
  @ApiOkResponse({ type: IntegrationGuestResponseDto })
  @ApiResponse({ status: 401, type: IntegrationErrorDto })
  @ApiResponse({
    status: 404,
    type: IntegrationErrorDto,
    description: 'El invitado no existe en el evento del token.',
  })
  async get(
    @CurrentApiToken() token: ApiTokenPrincipal,
    @Param('guestId') guestId: string,
  ): Promise<IntegrationGuestResponseDto> {
    return toIntegrationGuest(
      await this.guests.getForEvent(token.eventId, guestId),
    );
  }

  @Patch(':guestId')
  @ApiOperation({
    summary: 'Actualizar un invitado',
    description:
      'Requiere un token `read_write` y la `version` obtenida en la consulta más reciente. Los campos omitidos no cambian; `null` limpia campos anulables.',
  })
  @ApiBody({
    type: IntegrationUpdateGuestDto,
    examples: {
      confirmation: {
        summary: 'Confirmar asistencia',
        value: { rsvp: 'confirmed', companions: 1, version: 3 },
      },
      clearNotes: {
        summary: 'Limpiar notas',
        value: { notes: null, version: 3 },
      },
    },
  })
  @ApiOkResponse({ type: IntegrationGuestResponseDto })
  @ApiResponse({
    status: 400,
    type: IntegrationErrorDto,
    description: 'Cuerpo inválido o sin cambios.',
  })
  @ApiResponse({ status: 401, type: IntegrationErrorDto })
  @ApiResponse({
    status: 403,
    type: IntegrationErrorDto,
    description: 'El token es de sólo lectura.',
  })
  @ApiResponse({ status: 404, type: IntegrationErrorDto })
  @ApiResponse({
    status: 409,
    type: IntegrationErrorDto,
    description: 'La versión quedó obsoleta.',
  })
  async update(
    @CurrentApiToken() token: ApiTokenPrincipal,
    @Param('guestId') guestId: string,
    @Body() dto: IntegrationUpdateGuestDto,
  ): Promise<IntegrationGuestResponseDto> {
    this.apiTokens.requireWrite(token);
    const changedFields = Object.keys(dto).filter(
      (field) => field !== 'version',
    );
    if (!changedFields.length) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'NO_GUEST_CHANGES',
        'Incluye al menos un campo del invitado para actualizar',
      );
    }
    return toIntegrationGuest(
      await this.guests.updateForEvent(token.eventId, guestId, dto),
    );
  }
}

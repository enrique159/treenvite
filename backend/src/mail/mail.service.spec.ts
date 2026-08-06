import { MailService } from './mail.service';

describe('MailService', () => {
  it('builds verification links against the configured frontend origin', async () => {
    const config = {
      get: jest.fn((key: string, fallback?: unknown) => {
        const values: Record<string, unknown> = {
          FRONTEND_ORIGIN: 'https://app.example.com',
        };
        return values[key] ?? fallback;
      }),
    };
    const service = new MailService(config as never);
    const sendMail = jest.fn().mockResolvedValue({});
    (
      service as unknown as { transporter: { sendMail: typeof sendMail } }
    ).transporter.sendMail = sendMail;

    await service.sendVerification(
      'ana@example.com',
      'Ana',
      'token con espacios',
    );

    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'ana@example.com',
        text: expect.stringContaining(
          'https://app.example.com/auth/verify?token=token%20con%20espacios',
        ),
      }),
    );
  });
});

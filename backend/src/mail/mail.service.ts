import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';
import type JSONTransport from 'nodemailer/lib/json-transport';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

@Injectable()
export class MailService {
  private readonly transporter: Transporter;
  private readonly from: string;
  private readonly webUrl: string;

  constructor(private readonly config: ConfigService) {
    const host = config.get<string>('SMTP_HOST');
    this.transporter = host
      ? nodemailer.createTransport({
          host,
          port: config.get<number>('SMTP_PORT', 587),
          secure: config.get<boolean>('SMTP_SECURE', false),
          auth: config.get<string>('SMTP_USER')
            ? { user: config.get<string>('SMTP_USER'), pass: config.get<string>('SMTP_PASS') }
            : undefined,
        } as SMTPTransport.Options)
      : nodemailer.createTransport({ jsonTransport: true } as JSONTransport.Options);
    this.from = config.get<string>('SMTP_FROM', 'Treenvite <no-reply@treenvite.local>');
    this.webUrl = config.get<string>('FRONTEND_ORIGIN', 'http://localhost:5173');
  }

  async sendVerification(email: string, name: string, token: string): Promise<void> {
    const url = `${this.webUrl}/auth/verify?token=${encodeURIComponent(token)}`;
    await this.send(email, 'Confirma tu cuenta en Treenvite', `Hola ${name}, confirma tu cuenta: ${url}`, url);
  }

  async sendPasswordReset(email: string, name: string, token: string): Promise<void> {
    const url = `${this.webUrl}/auth/reset-password?token=${encodeURIComponent(token)}`;
    await this.send(email, 'Restablece tu contraseña de Treenvite', `Hola ${name}, restablece tu contraseña: ${url}`, url);
  }

  async sendInvitation(email: string, eventName: string, token: string): Promise<void> {
    const url = `${this.webUrl}/invitations/${encodeURIComponent(token)}`;
    await this.send(email, `Te invitaron a ${eventName}`, `Acepta tu invitación a ${eventName}: ${url}`, url);
  }

  private async send(to: string, subject: string, text: string, actionUrl: string): Promise<void> {
    await this.transporter.sendMail({
      from: this.from,
      to,
      subject,
      text,
      html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px"><h1 style="color:#1f4d3e">Treenvite</h1><p>${text.split(': ')[0]}.</p><p><a href="${actionUrl}" style="display:inline-block;background:#e96f51;color:white;padding:12px 18px;border-radius:8px;text-decoration:none">Continuar</a></p><p style="color:#6b7c75;font-size:12px">Si no esperabas este mensaje, puedes ignorarlo.</p></div>`,
    });
  }
}

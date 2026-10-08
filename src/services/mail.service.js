import nodemailer from 'nodemailer';
import { config } from '../config/config.js';
import { logger } from '../utils/logger.js';

/**
 * Las credenciales SIEMPRE salen de variables de entorno (ver .env.example).
 * Si el mailer no esta configurado, la API sigue funcionando y solo se loguea un aviso.
 */
export class MailService {
  constructor() {
    this.enabled = config.mail.enabled;
    this.transporter = this.enabled
      ? nodemailer.createTransport({
          host: config.mail.host,
          port: config.mail.port,
          secure: config.mail.port === 465,
          auth: { user: config.mail.user, pass: config.mail.pass },
        })
      : null;
  }

  async send({ to, subject, html }) {
    if (!this.enabled) {
      logger.warn(`Mailer deshabilitado (faltan variables MAIL_*). Email omitido: "${subject}" -> ${to}`);
      return { skipped: true };
    }

    const info = await this.transporter.sendMail({ from: config.mail.from, to, subject, html });
    logger.info(`Email enviado a ${to} (${info.messageId})`);
    return info;
  }

  buildTicketConfirmationHtml({ user, event, ticket }) {
    const date = new Date(event.date).toLocaleString('es-AR', { dateStyle: 'full', timeStyle: 'short' });
    return `
      <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:auto;color:#111">
        <h2 style="color:#4f46e5">Inscripcion confirmada</h2>
        <p>Hola ${user.first_name}, tu inscripcion se registro correctamente.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:6px 0"><b>Evento</b></td><td>${event.title}</td></tr>
          <tr><td style="padding:6px 0"><b>Fecha</b></td><td>${date}</td></tr>
          <tr><td style="padding:6px 0"><b>Lugar</b></td><td>${event.location}</td></tr>
          <tr><td style="padding:6px 0"><b>Entradas</b></td><td>${ticket.quantity}</td></tr>
          <tr><td style="padding:6px 0"><b>Codigo</b></td><td><b>${ticket.reservationCode}</b></td></tr>
        </table>
        <p style="font-size:13px;color:#555">Presenta este codigo el dia del evento. Si no podes asistir, podes cancelar tu inscripcion desde la plataforma.</p>
      </div>
    `;
  }

  /**
   * No bloquea la respuesta HTTP: si el envio falla, se loguea el error.
   */
  async sendTicketConfirmation({ user, event, ticket }) {
    try {
      return await this.send({
        to: user.email,
        subject: `Inscripcion confirmada - ${event.title} (${ticket.reservationCode})`,
        html: this.buildTicketConfirmationHtml({ user, event, ticket }),
      });
    } catch (error) {
      logger.error(`No se pudo enviar el email de confirmacion a ${user.email}: ${error.message}`);
      return { error: true };
    }
  }

  async sendTicketCancellation({ user, event, ticket }) {
    try {
      return await this.send({
        to: user.email,
        subject: `Inscripcion cancelada - ${event.title}`,
        html: `<p>Hola ${user.first_name}, cancelamos tu inscripcion <b>${ticket.reservationCode}</b> al evento <b>${event.title}</b>. El cupo quedo liberado.</p>`,
      });
    } catch (error) {
      logger.error(`No se pudo enviar el email de cancelacion a ${user.email}: ${error.message}`);
      return { error: true };
    }
  }
}

export const mailService = new MailService();

export default mailService;

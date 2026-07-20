import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST;
const FROM_ADDRESS = process.env.SMTP_FROM ?? 'orders@novaterra.apparel';

const transporter = SMTP_HOST
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    })
  : null;

export async function sendEmail(to: string, subject: string, body: string) {
  if (!transporter) {
    console.log(`[DEV MODE — no SMTP_HOST configured] would send email\n  to: ${to}\n  subject: ${subject}\n  body: ${body}`);
    return;
  }
  await transporter.sendMail({ from: FROM_ADDRESS, to, subject, text: body });
}

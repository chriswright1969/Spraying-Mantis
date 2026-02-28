// /src/mailer.js
import nodemailer from "nodemailer";

export function makeTransport() {
  const host = String(process.env.SMTP_HOST || "").trim();
  const port = Number(process.env.SMTP_PORT || 587);
  const user = String(process.env.SMTP_USER || "").trim();
  const pass = String(process.env.SMTP_PASS || "");

  if (!host) throw new Error("Missing SMTP_HOST");
  if (!port) throw new Error("Missing/invalid SMTP_PORT");
  if (!user) throw new Error("Missing SMTP_USER");
  if (!pass) throw new Error("Missing SMTP_PASS");

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function sendContactMail({ name, email, message }) {
  const transporter = makeTransport();

  const to = String(process.env.MAIL_TO || "").trim();
  const from = String(process.env.MAIL_FROM || "").trim();

  if (!to) throw new Error("Missing MAIL_TO");
  if (!from) throw new Error("Missing MAIL_FROM");

  const safeName = String(name || "").trim();
  const safeEmail = String(email || "").trim();
  const safeMsg = String(message || "").trim();

  await transporter.sendMail({
    to,
    from,
    replyTo: safeEmail || undefined,
    subject: `Website enquiry — ${safeName || "Unknown"}`,
    text: `Name: ${safeName}\nEmail: ${safeEmail}\n\n${safeMsg}`,
  });
}

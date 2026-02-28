// /src/mailer.js
import nodemailer from "nodemailer";

function env(name, fallback = "") {
  return String(process.env[name] || fallback).trim();
}

export function makeTransport() {
  const host = env("SMTP_HOST");
  const port = Number(env("SMTP_PORT", "587"));
  const user = env("SMTP_USER");
  const pass = env("SMTP_PASS");

  if (!host) throw new Error("Missing SMTP_HOST");
  if (!port) throw new Error("Missing/invalid SMTP_PORT");
  if (!user) throw new Error("Missing SMTP_USER");
  if (!pass) throw new Error("Missing SMTP_PASS");

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // 465 = SSL, 587 = STARTTLS
    auth: { user, pass },
  });
}

export async function sendContactMail({ name, phone, email, message }) {
  const transporter = makeTransport();

  // Accept either naming convention
  const to = env("MAIL_TO") || env("FORM_RECIPIENT");
  const from = env("MAIL_FROM") || env("SMTP_FROM") || env("SMTP_USER");

  if (!to) throw new Error("Missing MAIL_TO (or FORM_RECIPIENT)");
  if (!from) throw new Error("Missing MAIL_FROM (or SMTP_FROM)");

  await transporter.sendMail({
    to,
    from,
    replyTo: email ? String(email).trim() : undefined,
    subject: `New website enquiry from ${name || "Unknown"}`,
    text: [
      `Name: ${name || "Not provided"}`,
      `Phone: ${phone || "Not provided"}`,
      `Email: ${email || "Not provided"}`,
      "",
      "Message:",
      message || "",
    ].join("\n"),
  });
}

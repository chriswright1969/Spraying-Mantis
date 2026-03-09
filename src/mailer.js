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
  const secureEnv = env("SMTP_SECURE");

  if (!host) throw new Error("Missing SMTP_HOST");
  if (!port || Number.isNaN(port)) throw new Error("Missing/invalid SMTP_PORT");
  if (!user) throw new Error("Missing SMTP_USER");
  if (!pass) throw new Error("Missing SMTP_PASS");

  const secure =
    secureEnv
      ? secureEnv.toLowerCase() === "true"
      : port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

export async function sendContactMail({ name, phone, email, message }) {
  const transporter = makeTransport();

  const to = env("MAIL_TO") || env("FORM_RECIPIENT");
  const fromAddress = env("MAIL_FROM") || env("SMTP_FROM") || env("SMTP_USER");
  const fromName = env("MAIL_FROM_NAME", "Spraying Mantis Website");

  if (!to) throw new Error("Missing MAIL_TO (or FORM_RECIPIENT)");
  if (!fromAddress) throw new Error("Missing MAIL_FROM (or SMTP_FROM or SMTP_USER)");

  const cleanName = String(name || "").trim();
  const cleanPhone = String(phone || "").trim();
  const cleanEmail = String(email || "").trim();
  const cleanMessage = String(message || "").trim();

  await transporter.verify();

  await transporter.sendMail({
    to,
    from: `"${fromName}" <${fromAddress}>`,
    replyTo: cleanEmail || undefined,
    subject: `New website enquiry from ${cleanName || "Unknown"}`,
    text: [
      `Name: ${cleanName || "Not provided"}`,
      `Phone: ${cleanPhone || "Not provided"}`,
      `Email: ${cleanEmail || "Not provided"}`,
      "",
      "Message:",
      cleanMessage || "No message provided",
    ].join("\n"),
    html: `
      <h2>New website enquiry</h2>
      <p><strong>Name:</strong> ${cleanName || "Not provided"}</p>
      <p><strong>Phone:</strong> ${cleanPhone || "Not provided"}</p>
      <p><strong>Email:</strong> ${cleanEmail || "Not provided"}</p>
      <p><strong>Message:</strong></p>
      <p>${(cleanMessage || "No message provided").replace(/\n/g, "<br>")}</p>
    `,
  });
}

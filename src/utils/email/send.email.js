import nodemailer from "nodemailer";

export async function sendEmail({
  from = process.env.APP_EMAIL,
  to = "",
  cc = "",
  bcc = "",
  text = "",
  html = "",
  subject = "Saraha App",
  attachments = [],
} = {}) {
  // Create a test account or replace with real credentials.
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.APP_EMAIL,
      pass: process.env.APP_PASSWORD,
    },
  });

  // Wrap in an async IIFE so we can use await.

  const info = await transporter.sendMail({
    from: `"Hadeer Mohamed 💕" <${from}>`,
    to,
    cc,
    bcc,
    text,
    html,
    subject,
    attachments,
  });

  console.log(info.messageId);
}

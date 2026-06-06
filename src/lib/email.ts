import nodemailer from "nodemailer";

interface SendEmailOptions {
  to: string;
  subject: string;
  body: string;
}

function readSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const isProd = process.env.NODE_ENV === "production";

  if (isProd && (!host || !user || !pass)) {
    throw new Error(
      "SMTP_HOST, SMTP_USER and SMTP_PASS must be set in production"
    );
  }

  if (!host || !user || !pass) {
    return null;
  }

  return {
    host,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  };
}

export async function sendEmail({ to, subject, body }: SendEmailOptions) {
  const smtpConfig = readSmtpConfig();
  const isProd = process.env.NODE_ENV === "production";

  let transporter: nodemailer.Transporter;

  if (smtpConfig) {
    transporter = nodemailer.createTransport(smtpConfig);
  } else {
    if (isProd) {
      throw new Error("SMTP not configured for production");
    }
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
  }

  const mailOptions = {
    from: process.env.SMTP_FROM || '"SimpleCRM" <noreply@simplecrm.local>',
    to,
    subject,
    text: body,
  };

  try {
    const info = await transporter.sendMail(mailOptions);

    if (!smtpConfig && !isProd) {
      console.log("Email sent (test): %s", nodemailer.getTestMessageUrl(info));
    }

    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email via SMTP");
  }
}

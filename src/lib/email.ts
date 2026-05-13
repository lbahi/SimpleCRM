import nodemailer from "nodemailer";

interface SendEmailOptions {
  to: string;
  subject: string;
  body: string;
}

export async function sendEmail({ to, subject, body }: SendEmailOptions) {
  // Use Ethereal for testing if no environment variables are set
  const isProd = process.env.NODE_ENV === "production";
  
  // Create a reusable transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.ethereal.email",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || "test@ethereal.email", // Replace with actual default or let it fail if missing in prod
      pass: process.env.SMTP_PASS || "testpass",
    },
  });

  // If using Ethereal without explicit config, generate a test account
  if (!process.env.SMTP_HOST && !isProd) {
    const testAccount = await nodemailer.createTestAccount();
    const options = transporter.options as any;
    options.host = "smtp.ethereal.email";
    options.port = 587;
    options.secure = false;
    options.auth = {
      user: testAccount.user,
      pass: testAccount.pass,
    };
  }

  const mailOptions = {
    from: process.env.SMTP_FROM || '"SimpleCRM" <noreply@simplecrm.local>',
    to,
    subject,
    text: body, // plaintext body
    // html: body // could parse markdown to HTML here
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: %s", info.messageId);
    
    // Preview only available when sending through an Ethereal account
    if (!process.env.SMTP_HOST && !isProd) {
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
    
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email via SMTP");
  }
}

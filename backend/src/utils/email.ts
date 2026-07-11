import nodemailer from 'nodemailer';

type SendMailParams = {
    to: string;
    subject: string;
    html: string;
    text?: string;
};

const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpSecure = process.env.SMTP_SECURE === 'true';

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
    if (transporter) return transporter;

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
        throw new Error('SMTP configuration is incomplete. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS.');
    }

    transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
            user: smtpUser,
            pass: smtpPass,
        },
    });

    return transporter;
}

export async function sendMail({ to, subject, html, text }: SendMailParams): Promise<void> {
    const transport = getTransporter();

    await transport.sendMail({
        from: process.env.SMTP_FROM || smtpUser,
        to,
        subject,
        text,
        html,
    });
}

export function getShipmentCreatedEmail({
    recipientName,
    trackingNumber,
    originCity,
    originCountry,
    destinationCity,
    destinationCountry,
    estimatedDelivery,
    trackingUrl,
}: {
    recipientName: string;
    trackingNumber: string;
    originCity: string;
    originCountry: string;
    destinationCity: string;
    destinationCountry: string;
    estimatedDelivery?: string | null;
    trackingUrl: string;
}) {
    const subject = `Your shipment has been created: ${trackingNumber}`;
    const estimatedDeliveryLine = estimatedDelivery ? `<p><strong>Estimated delivery:</strong> ${estimatedDelivery}</p>` : '';

    const html = `
        <div style="font-family: Arial, sans-serif; color: #222;">
            <h2>Shipment Created</h2>
            <p>Hi ${recipientName},</p>
            <p>Your shipment has been created successfully and assigned tracking number <strong>${trackingNumber}</strong>.</p>
            <p><strong>Route:</strong> ${originCity}, ${originCountry} → ${destinationCity}, ${destinationCountry}</p>
            ${estimatedDeliveryLine}
            <p>You can follow the shipment progress here:</p>
            <p><a href="${trackingUrl}" target="_blank" rel="noopener">View shipment tracking</a></p>
            <p>Thank you for using our service.</p>
        </div>
    `;

    const text = `Shipment Created\n
Hi ${recipientName},\n\n` +
        `Your shipment has been created successfully and assigned tracking number ${trackingNumber}.\n\n` +
        `Route: ${originCity}, ${originCountry} → ${destinationCity}, ${destinationCountry}\n` +
        (estimatedDelivery ? `Estimated delivery: ${estimatedDelivery}\n` : '') +
        `Track your shipment: ${trackingUrl}\n\n` +
        `Thank you for using our service.`;

    return { subject, html, text };
}

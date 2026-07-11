type SendMailParams = {
    to: string;
    subject: string;
    html: string;
    text?: string;
};
export declare function sendMail({ to, subject, html, text }: SendMailParams): Promise<void>;
export declare function getShipmentCreatedEmail({ recipientName, trackingNumber, originCity, originCountry, destinationCity, destinationCountry, estimatedDelivery, trackingUrl, }: {
    recipientName: string;
    trackingNumber: string;
    originCity: string;
    originCountry: string;
    destinationCity: string;
    destinationCountry: string;
    estimatedDelivery?: string | null;
    trackingUrl: string;
}): {
    subject: string;
    html: string;
    text: string;
};
export {};
//# sourceMappingURL=email.d.ts.map
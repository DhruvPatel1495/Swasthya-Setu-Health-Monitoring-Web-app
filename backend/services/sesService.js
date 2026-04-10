import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import dotenv from 'dotenv';
dotenv.config();

const client = new SESClient({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKey_id: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

/**
 * Sends a transactional email using AWS SES (Free tier includes 62k emails/month from EC2)
 */
export const sendEmail = async (to, subject, body, isHtml = false) => {
    // If keys aren't set, we mock the email send
    if (!process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID === 'your_aws_access_key') {
        console.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
        return { messageId: "mock-id-123" };
    }

    try {
        const command = new SendEmailCommand({
            Destination: {
                ToAddresses: [to],
            },
            Message: {
                Body: {
                    [isHtml ? "Html" : "Text"]: {
                        Data: body,
                        Charset: "UTF-8",
                    },
                },
                Subject: {
                    Data: subject,
                    Charset: "UTF-8",
                },
            },
            Source: process.env.SES_SENDER_EMAIL || "notifications@swasthyasetu.com",
        });

        const response = await client.send(command);
        console.log(`Email sent successfully: ${response.MessageId}`);
        return response;
    } catch (error) {
        console.error("Error sending email via SES:", error);
        throw new Error("Email Dispatch Failed");
    }
};

/**
 * Specifically for Health Alerts
 */
export const sendHealthAlert = async (patientEmail, patientName, anomalyDetails) => {
    const subject = `⚠️ URGENT: Health Alert for ${patientName}`;
    const body = `
        Hello,
        
        Our AI system has detected a health anomaly in your recent vitals:
        
        Details: ${anomalyDetails}
        
        Please contact your doctor immediately or check your dashboard for more information.
        
        Stay safe,
        Swasthya Setu AI
    `;
    return sendEmail(patientEmail, subject, body);
};

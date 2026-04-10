import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';
dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'dummy',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'dummy'
  }
});

export const uploadReportToS3 = async (patientId, fileBuffer, fileName) => {
  // If no keys are provided, we'll return a mock URL (only for local testing)
  if (!process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID === 'your_aws_access_key') {
     console.log("Mocking S3 upload due to missing keys.");
     return `reports/${patientId}/${fileName}`; // Returning key instead of mock URL
  }

  try {
    const params = {
      Bucket: process.env.S3_BUCKET_NAME || 'neuropulse-reports',
      Key: `reports/${patientId}/${fileName}`,
      Body: fileBuffer,
      ContentType: 'application/pdf'
    };

    await s3Client.send(new PutObjectCommand(params));
    return params.Key; // We store the KEY in the DB for private buckets
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw new Error("S3 Upload Failed");
  }
};

/**
 * Generates a temporary (Time-limited) URL for a private S3 object
 * expires in 1 hour (3600 seconds)
 */
export const getPresignedUrl = async (key) => {
  if (!process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID === 'your_aws_access_key') {
     return `https://mock-s3-bucket.s3.amazonaws.com/${key}`;
  }

  try {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME || 'neuropulse-reports',
      Key: key,
    });
    
    return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  } catch (error) {
    console.error("Error generating Signed URL:", error);
    return null;
  }
};

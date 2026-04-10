import { SSMClient, GetParameterCommand, GetParametersByPathCommand } from "@aws-sdk/client-ssm";
import dotenv from 'dotenv';
dotenv.config();

const client = new SSMClient({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

/**
 * Fetches all parameters under a specific path (e.g., /swasthya-setu/prod/)
 * and populates process.env.
 * This replaces the need for a local .env file in production.
 */
export const loadConfigFromSSM = async (path = "/swasthya-setu/prod/") => {
    try {
        console.log(`Loading configuration from AWS SSM: ${path}`);
        const command = new GetParametersByPathCommand({
            Path: path,
            WithDecryption: true,
            Recursive: true,
        });

        const response = await client.send(command);
        
        if (response.Parameters && response.Parameters.length > 0) {
            response.Parameters.forEach((param) => {
                const key = param.Name.replace(path, "");
                process.env[key] = param.Value;
                console.log(`Loaded ${key} from SSM`);
            });
        } else {
            console.warn("No parameters found in SSM for path:", path);
        }
    } catch (error) {
        if (error.name === "UnrecognizedClientException") {
            console.warn("AWS Credentials not configured. Skipping SSM config load.");
        } else {
            console.error("Error loading config from SSM:", error);
        }
    }
};

/**
 * Utility to get a single parameter
 */
export const getSSMParameter = async (name) => {
    try {
        const command = new GetParameterCommand({
            Name: name,
            WithDecryption: true,
        });
        const response = await client.send(command);
        return response.Parameter.Value;
    } catch (error) {
        console.error(`Error fetching SSM parameter ${name}:`, error);
        return null;
    }
};

import dotenv from 'dotenv';

dotenv.config();

export const apiVersion = process.env.APP_VERSION;
export const defaultPort = process.env.NODE_PORT;

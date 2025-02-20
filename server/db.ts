import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

const DATABASE_URL = `postgresql://neondb_owner:npg_TfP4cDvBiKC8@ep-winter-bird-a5j3vl8l.us-east-2.aws.neon.tech/neondb?sslmode=require`;


export const pool = new Pool({ connectionString: DATABASE_URL });
export const db = drizzle({ client: pool, schema });

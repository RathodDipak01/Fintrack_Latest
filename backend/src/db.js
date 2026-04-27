import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';


import pkg from '@prisma/client';
const { PrismaClient } = pkg;

import { env } from './config/env.js';

const connectionString = env.databaseUrl || process.env.DATABASE_URL;

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });

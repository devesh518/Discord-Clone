import { PrismaClient } from "@prisma/client";

// Declaring a global variable prisma with type either PrismaClient or undefined
declare global {
    var prisma: PrismaClient | undefined
}

// Export a constant named 'db' which is either the globally declared 'prisma' or a new instance of PrismaClient
export const db = globalThis.prisma || new PrismaClient();

// If the app is not in production mode, set prisma equal to the const db
if(process.env.NODE_ENV != "production") globalThis.prisma = db;
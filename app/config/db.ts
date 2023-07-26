import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

prisma
  .$connect()
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((reason: any) => {
    console.log("Database connect error:", reason);
  });

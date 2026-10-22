import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const endpoint = await prisma.endpoint.upsert({
    where: { id: "ep_dev_test_123" },
    update: {
      name: "Default Local Dev Gateway",
      secretKey: "hb_sec_dev_local_test_token",
      targetUrl: "http://localhost:3000/api/webhook",
    },
    create: {
      id: "ep_dev_test_123",
      name: "Default Local Dev Gateway",
      secretKey: "hb_sec_dev_local_test_token",
      targetUrl: "http://localhost:3000/api/webhook",
    },
  });
  console.log("Seeded endpoint:", endpoint);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

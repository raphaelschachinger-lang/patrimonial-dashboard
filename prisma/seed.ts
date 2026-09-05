import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.AUTH_USER_EMAIL;
  const passwordHash = process.env.AUTH_PASSWORD_HASH;

  if (!email || !passwordHash) {
    throw new Error(
      "AUTH_USER_EMAIL et AUTH_PASSWORD_HASH doivent être définis (voir .env.example)"
    );
  }

  const user = await prisma.user.upsert({
    where: { email },
    create: { email, passwordHash },
    update: { passwordHash },
  });

  console.log(`Utilisateur prêt : ${user.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

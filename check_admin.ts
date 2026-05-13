import { prisma } from "./src/lib/prisma";

async function check() {
  const admin = await prisma.user.findUnique({
    where: { email: "admin@simplecrm.com" }
  });
  console.log("Admin exists:", !!admin);
  if (admin) {
    console.log("Admin isActive:", admin.isActive);
    console.log("Admin role:", admin.role);
  }
}

check();

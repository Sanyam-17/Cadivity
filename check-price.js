const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
prisma.course.findUnique({where: {slug: "creo-pro-toolkit-development"}})
  .then(c => console.log("Price:", c.price, "OriginalPrice:", c.originalPrice))
  .finally(() => prisma.$disconnect());

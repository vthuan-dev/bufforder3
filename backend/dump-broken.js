const prisma = require('./lib/prisma');

async function getBroken() {
  const list = await prisma.product.findMany({
    where: { id: { gte: 2101 } },
    orderBy: { id: 'asc' }
  });
  console.log(JSON.stringify(list, null, 2));
  await prisma.$disconnect();
}

getBroken().catch(console.error);

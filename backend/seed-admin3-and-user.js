const prisma = require('./lib/prisma');
const bcrypt = require('bcryptjs');

async function main() {
  // 1. Create admin3
  const adminHashed = await bcrypt.hash('admin123', 10);
  const admin = await prisma.admin.upsert({
    where: { username: 'admin3' },
    update: { password: adminHashed, isActive: true },
    create: {
      username: 'admin3',
      password: adminHashed,
      email: 'admin3@ashfordorders.com',
      fullName: 'Administrator 3',
      role: 'admin',
      isActive: true
    }
  });
  console.log('✅ Admin account created/updated:', admin.username);

  // 2. Create funded test user
  const userHashed = await bcrypt.hash('123456', 10);
  const user = await prisma.user.upsert({
    where: { phoneNumber: '0988888888' },
    update: {
      password: userHashed,
      balance: 50000,
      totalDeposited: 30000,
      vipLevel: 'vip-3',
      isActive: true
    },
    create: {
      phoneNumber: '0988888888',
      password: userHashed,
      fullName: 'VIP Demo User',
      email: 'vipdemo@ashfordorders.com',
      vipLevel: 'vip-3',
      balance: 50000,
      totalDeposited: 30000,
      commission: 0,
      freezeBalance: 0,
      isActive: true,
      inviteCodeUsed: '888888',
      commissionConfig: JSON.stringify({}),
      dailyEarnings: JSON.stringify({})
    }
  });
  console.log('✅ User account created/updated:', user.phoneNumber, '| Balance: $' + user.balance, '| VIP:', user.vipLevel);
}

main().catch(console.error).finally(async () => {
  await prisma.$disconnect();
});

require('dotenv').config();

module.exports = {
  // MySQL (Prisma)
  DATABASE_URL: process.env.DATABASE_URL || 'mysql://root:password@localhost:3306/greeting_message',
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret_key_here_change_this_in_production',
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  INVITE_CODE: process.env.INVITE_CODE || '888888',
  INVITE_CODES: [
    '686868',
    '888888',
        '528194',
        '739461',
        '816352'
      ]
};

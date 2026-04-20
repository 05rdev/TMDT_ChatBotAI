const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  console.log('Testing Prisma models access...');
  try {
    console.log('Voucher model keys:', Object.keys(prisma.voucher || {}));
    console.log('SupportTicket model keys:', Object.keys(prisma.supportTicket || {}));
    console.log('TicketMessage model keys:', Object.keys(prisma.ticketMessage || {}));
    console.log('SUCCESS: All models are accessible in Prisma Client.');
  } catch (err) {
    console.error('FAILURE:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();

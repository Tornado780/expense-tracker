const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function main() {
  console.log('Seeding demo data...')
  const passwordHash = await bcrypt.hash('demo1234', 10)
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: { email: 'demo@example.com', name: 'Demo User', passwordHash, currency: 'INR' }
  })
  const now = new Date()
  const expenses = [
    { description: 'Swiggy dinner', amount: 450, category: 'Food & Dining', confidence: 0.95 },
    { description: 'Uber to office', amount: 180, category: 'Transport', confidence: 0.92 },
    { description: 'Netflix subscription', amount: 499, category: 'Entertainment', confidence: 0.98 },
    { description: 'Electricity bill', amount: 1200, category: 'Utilities', confidence: 0.91 },
    { description: 'Pharmacy medicine', amount: 350, category: 'Health', confidence: 0.88 },
    { description: 'Zomato lunch', amount: 280, category: 'Food & Dining', confidence: 0.93 },
    { description: 'Metro recharge', amount: 500, category: 'Transport', confidence: 0.89 },
    { description: 'Amazon Prime', amount: 179, category: 'Entertainment', confidence: 0.97 },
    { description: 'Internet bill', amount: 799, category: 'Utilities', confidence: 0.94 },
    { description: 'Grocery store', amount: 2100, category: 'Food & Dining', confidence: 0.85 }
  ]
  for (const e of expenses) {
    await prisma.expense.create({
      data: { userId: user.id, date: new Date(now.getFullYear(), now.getMonth(), Math.floor(Math.random()*20)+1), ...e }
    })
  }
  console.log('Done. Login: demo@example.com / demo1234')
}

main().catch(console.error).finally(() => prisma.$disconnect())
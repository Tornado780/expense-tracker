const { z } = require('zod')
const prisma = require('../lib/prisma')

const CATEGORIES = ['Food & Dining', 'Transport', 'Entertainment', 'Utilities', 'Health', 'Other']

const expenseSchema = z.object({
  amount: z.number().positive('Amount must be a positive number'),
  description: z.string().min(1, 'Description is required').max(300),
  category: z.enum(CATEGORIES).optional(),
  date: z.string().datetime().optional()
})

const getExpenses = async (req, res) => {
  const { category, from, to, page = 1, limit = 20 } = req.query
  const where = { userId: req.user.userId }
  if (category && CATEGORIES.includes(category)) where.category = category
  if (from || to) {
    where.date = {}
    if (from) where.date.gte = new Date(from)
    if (to) where.date.lte = new Date(to)
  }
  const pageNum = Math.max(1, parseInt(page))
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)))
  try {
    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        orderBy: { date: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum
      }),
      prisma.expense.count({ where })
    ])
    res.json({ expenses, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) })
  } catch (err) {
    console.error('Get expenses error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

const getSummary = async (req, res) => {
  const now = new Date()
  const month = parseInt(req.query.month) || now.getMonth() + 1
  const year = parseInt(req.query.year) || now.getFullYear()
  const from = new Date(year, month - 1, 1)
  const to = new Date(year, month, 0, 23, 59, 59)
  try {
    const expenses = await prisma.expense.findMany({
      where: { userId: req.user.userId, date: { gte: from, lte: to } }
    })
    const byCategory = {}
    for (const cat of CATEGORIES) byCategory[cat] = 0
    for (const e of expenses) byCategory[e.category] = (byCategory[e.category] || 0) + e.amount
    const total = expenses.reduce((sum, e) => sum + e.amount, 0)
    const prevFrom = new Date(year, month - 2, 1)
    const prevTo = new Date(year, month - 1, 0, 23, 59, 59)
    const prevExpenses = await prisma.expense.findMany({
      where: { userId: req.user.userId, date: { gte: prevFrom, lte: prevTo } }
    })
    const prevTotal = prevExpenses.reduce((sum, e) => sum + e.amount, 0)
    res.json({ month, year, total, count: expenses.length, byCategory, prevTotal })
  } catch (err) {
    console.error('Get summary error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

const createExpense = async (req, res) => {
  const result = expenseSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ error: result.error.flatten().fieldErrors })
  }
  const { amount, description, category, date } = result.data
  try {
    // Phase 2: ML auto-categorization will be wired in here
    let finalCategory = category || 'Other'
    let confidence = null

    const expense = await prisma.expense.create({
      data: {
        userId: req.user.userId,
        amount,
        description,
        category: finalCategory,
        confidence,
        date: date ? new Date(date) : new Date()
      }
    })

    // Phase 3: Budget alert check will be wired in here

    res.status(201).json(expense)
  } catch (err) {
    console.error('Create expense error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

const updateExpense = async (req, res) => {
  const { id } = req.params
  const result = expenseSchema.partial().safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ error: result.error.flatten().fieldErrors })
  }
  try {
    const existing = await prisma.expense.findUnique({ where: { id } })
    if (!existing || existing.userId !== req.user.userId) {
      return res.status(404).json({ error: 'Expense not found' })
    }
    const updateData = { ...result.data }
    if (result.data.date) updateData.date = new Date(result.data.date)
    const updated = await prisma.expense.update({ where: { id }, data: updateData })
    res.json(updated)
  } catch (err) {
    console.error('Update expense error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

const deleteExpense = async (req, res) => {
  const { id } = req.params
  try {
    const existing = await prisma.expense.findUnique({ where: { id } })
    if (!existing || existing.userId !== req.user.userId) {
      return res.status(404).json({ error: 'Expense not found' })
    }
    await prisma.expense.delete({ where: { id } })
    res.json({ message: 'Expense deleted successfully' })
  } catch (err) {
    console.error('Delete expense error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

const exportCSV = async (req, res) => {
  const { from, to } = req.query
  const where = { userId: req.user.userId }
  if (from || to) {
    where.date = {}
    if (from) where.date.gte = new Date(from)
    if (to) where.date.lte = new Date(to)
  }
  try {
    const expenses = await prisma.expense.findMany({ where, orderBy: { date: 'desc' } })
    const header = 'Date,Description,Category,Amount,Confidence\n'
    const rows = expenses.map(e =>
      `${e.date.toISOString().split('T')[0]},"${e.description}",${e.category},${e.amount},${e.confidence ?? ''}`
    ).join('\n')
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename=expenses.csv')
    res.send(header + rows)
  } catch (err) {
    console.error('Export CSV error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

module.exports = { getExpenses, getSummary, createExpense, updateExpense, deleteExpense, exportCSV }

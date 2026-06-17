const { z } = require('zod')
const prisma = require('../lib/prisma')

const CATEGORIES = ['Food & Dining', 'Transport', 'Entertainment', 'Utilities', 'Health', 'Other']

const budgetSchema = z.object({
  category: z.enum(CATEGORIES),
  limitAmount: z.number().positive('Limit must be a positive number'),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2024).max(2100)
})

// ── Helper: check budget and create alert if needed ────────────
const checkBudgetAndAlert = async (userId, category, month, year) => {
  try {
    const budget = await prisma.budget.findUnique({
      where: { userId_category_month_year: { userId, category, month, year } }
    })
    if (!budget) return

    // Sum all expenses in this category this month
    const from = new Date(year, month - 1, 1)
    const to = new Date(year, month, 0, 23, 59, 59)
    const result = await prisma.expense.aggregate({
      where: { userId, category, date: { gte: from, lte: to } },
      _sum: { amount: true }
    })
    const totalSpent = result._sum.amount || 0
    const percentage = (totalSpent / budget.limitAmount) * 100

    // Fire alert at 80% and again at 100%
    if (percentage >= 100) {
      await prisma.alert.create({
        data: {
          userId,
          budgetId: budget.id,
          type: 'EXCEEDED',
          message: `You have exceeded your ${category} budget! Spent ₹${totalSpent.toFixed(0)} of ₹${budget.limitAmount} limit.`
        }
      })
    } else if (percentage >= 80) {
      await prisma.alert.create({
        data: {
          userId,
          budgetId: budget.id,
          type: 'WARNING',
          message: `You've used ${percentage.toFixed(0)}% of your ${category} budget. ₹${(budget.limitAmount - totalSpent).toFixed(0)} remaining.`
        }
      })
    }
  } catch (err) {
    console.error('Budget alert check error:', err)
    // Never crash the main request due to alert failure
  }
}

const getBudgets = async (req, res) => {
  const now = new Date()
  const month = parseInt(req.query.month) || now.getMonth() + 1
  const year = parseInt(req.query.year) || now.getFullYear()

  try {
    const budgets = await prisma.budget.findMany({
      where: { userId: req.user.userId, month, year },
      orderBy: { category: 'asc' }
    })

    // Enrich each budget with current spending
    const from = new Date(year, month - 1, 1)
    const to = new Date(year, month, 0, 23, 59, 59)

    const enriched = await Promise.all(budgets.map(async (b) => {
      const result = await prisma.expense.aggregate({
        where: { userId: req.user.userId, category: b.category, date: { gte: from, lte: to } },
        _sum: { amount: true }
      })
      const spent = result._sum.amount || 0
      return {
        ...b,
        spent,
        remaining: b.limitAmount - spent,
        percentage: Math.round((spent / b.limitAmount) * 100)
      }
    }))

    res.json(enriched)
  } catch (err) {
    console.error('Get budgets error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

const createBudget = async (req, res) => {
  const result = budgetSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ error: result.error.flatten().fieldErrors })
  }
  const { category, limitAmount, month, year } = result.data

  try {
    const existing = await prisma.budget.findUnique({
      where: { userId_category_month_year: { userId: req.user.userId, category, month, year } }
    })
    if (existing) {
      return res.status(409).json({ error: 'Budget for this category and month already exists. Use PATCH to update it.' })
    }

    const budget = await prisma.budget.create({
      data: { userId: req.user.userId, category, limitAmount, month, year }
    })
    res.status(201).json(budget)
  } catch (err) {
    console.error('Create budget error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

const updateBudget = async (req, res) => {
  const { id } = req.params
  const schema = z.object({ limitAmount: z.number().positive() })
  const result = schema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ error: result.error.flatten().fieldErrors })
  }

  try {
    const existing = await prisma.budget.findUnique({ where: { id } })
    if (!existing || existing.userId !== req.user.userId) {
      return res.status(404).json({ error: 'Budget not found' })
    }

    const updated = await prisma.budget.update({
      where: { id },
      data: { limitAmount: result.data.limitAmount }
    })
    res.json(updated)
  } catch (err) {
    console.error('Update budget error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

const deleteBudget = async (req, res) => {
  const { id } = req.params
  try {
    const existing = await prisma.budget.findUnique({ where: { id } })
    if (!existing || existing.userId !== req.user.userId) {
      return res.status(404).json({ error: 'Budget not found' })
    }
    await prisma.budget.delete({ where: { id } })
    res.json({ message: 'Budget deleted' })
  } catch (err) {
    console.error('Delete budget error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

module.exports = { getBudgets, createBudget, updateBudget, deleteBudget, checkBudgetAndAlert }
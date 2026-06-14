const router = require('express').Router()
const {
  getExpenses, getSummary, createExpense, updateExpense, deleteExpense, exportCSV
} = require('../controllers/expense.controller')
const auth = require('../middleware/auth')

router.use(auth)
router.get('/', getExpenses)
router.get('/summary', getSummary)
router.get('/export', exportCSV)
router.post('/', createExpense)
router.patch('/:id', updateExpense)
router.delete('/:id', deleteExpense)

module.exports = router
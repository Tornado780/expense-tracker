const router = require('express').Router()
const { getBudgets, createBudget, updateBudget, deleteBudget } = require('../controllers/budget.controller')
const auth = require('../middleware/auth')

router.use(auth)
router.get('/', getBudgets)
router.post('/', createBudget)
router.patch('/:id', updateBudget)
router.delete('/:id', deleteBudget)

module.exports = router
const router = require('express').Router()
const { getAlerts, markAsRead, markAllAsRead, deleteAlert } = require('../controllers/alert.controller')
const auth = require('../middleware/auth')

router.use(auth)
router.get('/', getAlerts)
router.patch('/read-all', markAllAsRead)
router.patch('/:id/read', markAsRead)
router.delete('/:id', deleteAlert)

module.exports = router
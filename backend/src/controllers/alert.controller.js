const prisma = require('../lib/prisma')

const getAlerts = async (req, res) => {
  try {
    const alerts = await prisma.alert.findMany({
      where: { userId: req.user.userId },
      orderBy: { sentAt: 'desc' },
      take: 50,
      include: {
        budget: {
          select: { category: true, limitAmount: true, month: true, year: true }
        }
      }
    })
    const unreadCount = alerts.filter(a => !a.isRead).length
    res.json({ alerts, unreadCount })
  } catch (err) {
    console.error('Get alerts error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

const markAsRead = async (req, res) => {
  const { id } = req.params
  try {
    const existing = await prisma.alert.findUnique({ where: { id } })
    if (!existing || existing.userId !== req.user.userId) {
      return res.status(404).json({ error: 'Alert not found' })
    }
    const updated = await prisma.alert.update({
      where: { id },
      data: { isRead: true }
    })
    res.json(updated)
  } catch (err) {
    console.error('Mark alert read error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

const markAllAsRead = async (req, res) => {
  try {
    await prisma.alert.updateMany({
      where: { userId: req.user.userId, isRead: false },
      data: { isRead: true }
    })
    res.json({ message: 'All alerts marked as read' })
  } catch (err) {
    console.error('Mark all read error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

const deleteAlert = async (req, res) => {
  const { id } = req.params
  try {
    const existing = await prisma.alert.findUnique({ where: { id } })
    if (!existing || existing.userId !== req.user.userId) {
      return res.status(404).json({ error: 'Alert not found' })
    }
    await prisma.alert.delete({ where: { id } })
    res.json({ message: 'Alert deleted' })
  } catch (err) {
    console.error('Delete alert error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

module.exports = { getAlerts, markAsRead, markAllAsRead, deleteAlert }
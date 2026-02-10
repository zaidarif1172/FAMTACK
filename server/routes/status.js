const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all active statuses from contacts
router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;
        const now = new Date();

        // Get all active statuses (including own) - simplified for testing
        const statuses = await prisma.status.findMany({
            where: {
                expiresAt: { gt: now }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        avatarUrl: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ statuses });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch statuses' });
    }
});

// Create a new status
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { content, imageUrl } = req.body;
        const userId = req.userId;

        if (!content && !imageUrl) {
            return res.status(400).json({ error: 'Status must have content or image' });
        }

        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours from now

        const status = await prisma.status.create({
            data: {
                userId,
                content,
                imageUrl,
                expiresAt
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        avatarUrl: true
                    }
                }
            }
        });

        res.json({ status });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create status' });
    }
});

// Delete a status
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const statusId = parseInt(req.params.id);
        const userId = req.userId;

        // Check ownership
        const status = await prisma.status.findUnique({
            where: { id: statusId }
        });

        if (!status || status.userId !== userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        await prisma.status.delete({
            where: { id: statusId }
        });

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete status' });
    }
});

module.exports = router;

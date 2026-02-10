const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Update profile
router.put('/profile', authMiddleware, async (req, res) => {
    try {
        const { username, avatarUrl } = req.body;
        const userId = req.userId;

        // Check if username is taken (if changing)
        if (username) {
            const existing = await prisma.user.findFirst({
                where: {
                    username,
                    NOT: { id: userId }
                }
            });

            if (existing) {
                return res.status(400).json({ error: 'Username already taken' });
            }
        }

        const updateData = {};
        if (username) updateData.username = username;
        if (avatarUrl) updateData.avatarUrl = avatarUrl;

        const user = await prisma.user.update({
            where: { id: userId },
            data: updateData
        });

        res.json({
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                avatarUrl: user.avatarUrl
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

module.exports = router;

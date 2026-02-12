const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Update profile
router.put('/profile', authMiddleware, async (req, res) => {
    try {
        const { fullName, avatarUrl } = req.body;
        const userId = req.userId;

        const updateData = {};
        if (fullName) updateData.fullName = fullName;
        if (avatarUrl) updateData.avatarUrl = avatarUrl;

        const user = await prisma.user.update({
            where: { id: userId },
            data: updateData
        });

        res.json({
            user: {
                id: user.id,
                fullName: user.fullName,
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

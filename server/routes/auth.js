const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Register
router.post('/register', async (req, res) => {
    try {
        const { email, password, fullName } = req.body;

        // Check existing
        const existing = await prisma.user.findFirst({
            where: { email }
        });

        if (existing) {
            return res.status(400).json({ error: 'Email already taken' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate username from email prefix (as a fallback/internal unique ID)
        const username = email.split('@')[0] + Math.floor(Math.random() * 1000);

        // Avatar boilerplate (e.g., dicebear)
        const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${fullName}`;

        const user = await prisma.user.create({
            data: {
                email,
                fullName,
                username,
                password: hashedPassword,
                avatarUrl
            }
        });

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
        res.status(201).json({ token, user: { id: user.id, fullName: user.fullName, email: user.email, avatarUrl: user.avatarUrl } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
        res.json({ token, user: { id: user.id, fullName: user.fullName, username: user.username, email: user.email, avatarUrl: user.avatarUrl } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Me (Get current user)
router.get('/me', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user) return res.status(401).json({ error: 'User not found' });

        res.json({ user: { id: user.id, fullName: user.fullName, username: user.username, email: user.email, avatarUrl: user.avatarUrl } });
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

module.exports = router;

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Add contact by email
router.post('/add', authMiddleware, async (req, res) => {
    try {
        const { email } = req.body;
        const userId = req.userId;

        // Find the user to add
        const contactUser = await prisma.user.findUnique({
            where: { email }
        });

        if (!contactUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (contactUser.id === userId) {
            return res.status(400).json({ error: 'Cannot add yourself as a contact' });
        }

        // Check if already a contact
        const existing = await prisma.contact.findFirst({
            where: {
                userId,
                contactId: contactUser.id
            }
        });

        if (existing) {
            return res.status(400).json({ error: 'Already in your contacts' });
        }

        // Add contact (bidirectional)
        await prisma.contact.create({
            data: {
                userId,
                contactId: contactUser.id
            }
        });

        await prisma.contact.create({
            data: {
                userId: contactUser.id,
                contactId: userId
            }
        });

        res.json({ message: 'Contact added successfully', contact: contactUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add contact' });
    }
});

// Get user's contacts
router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;

        const contacts = await prisma.contact.findMany({
            where: { userId },
            include: {
                contact: {
                    select: {
                        id: true,
                        email: true,
                        username: true,
                        avatarUrl: true,
                        isOnline: true
                    }
                }
            }
        });

        const contactList = contacts.map(c => c.contact);
        res.json(contactList);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch contacts' });
    }
});

module.exports = router;

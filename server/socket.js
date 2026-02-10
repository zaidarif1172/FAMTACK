const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const connectedUsers = new Map(); // userId -> socketId

exports.initializeSocket = (io) => {
    io.on('connection', (socket) => {
        // console.log('User connected:', socket.id);

        socket.on('join', async (userId) => {
            socket.userId = userId; // Store for valid access in other events
            connectedUsers.set(userId, socket.id);
            await prisma.user.update({
                where: { id: userId },
                data: { isOnline: true }
            });
            io.emit('user_status_change', { userId, isOnline: true });
        });

        socket.on('send_message', async (data) => {
            // data: { senderId, receiverId, content }
            const { senderId, receiverId, content } = data;

            // Save to DB
            const message = await prisma.message.create({
                data: {
                    senderId,
                    receiverId,
                    content
                }
            });

            const receiverSocketId = connectedUsers.get(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('receive_message', message);
            }

            // Also emit back to sender (or handle optimistically in UI)
            // socket.emit('message_sent', message); 
        });

        socket.on('typing', (data) => {
            const { receiverId } = data;
            const receiverSocketId = connectedUsers.get(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('user_typing', { userId: socket.userId }); // socket.userId needs to be set on join or just pass senderId from client
            }
        });

        socket.on('stop_typing', (data) => {
            const { receiverId } = data;
            const receiverSocketId = connectedUsers.get(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('user_stopped_typing', { userId: socket.userId });
            }
        });

        // WebRTC Signaling for Voice/Video Calls
        socket.on('call_user', (data) => {
            const { to, offer, callType } = data;
            const receiverSocketId = connectedUsers.get(to);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('incoming_call', {
                    from: socket.userId,
                    offer,
                    callType
                });
            }
        });

        socket.on('answer_call', (data) => {
            const { to, answer } = data;
            const callerSocketId = connectedUsers.get(to);
            if (callerSocketId) {
                io.to(callerSocketId).emit('call_answered', { answer });
            }
        });

        socket.on('ice_candidate', (data) => {
            const { to, candidate } = data;
            const targetSocketId = connectedUsers.get(to);
            if (targetSocketId) {
                io.to(targetSocketId).emit('ice_candidate', { candidate });
            }
        });

        socket.on('end_call', (data) => {
            const { to } = data;
            const targetSocketId = connectedUsers.get(to);
            if (targetSocketId) {
                io.to(targetSocketId).emit('call_ended');
            }
        });

        socket.on('read_messages', async (data) => {
            const { senderId } = data;
            const receiverId = socket.userId;

            await prisma.message.updateMany({
                where: {
                    senderId: senderId,
                    receiverId: receiverId,
                    isRead: false
                },
                data: { isRead: true }
            });

            const senderSocketId = connectedUsers.get(senderId);
            if (senderSocketId) {
                io.to(senderSocketId).emit('messages_read', { receiverId });
            }
        });

        socket.on('disconnect', async () => {
            let disconnectedUserId;
            for (const [userId, socketId] of connectedUsers.entries()) {
                if (socketId === socket.id) {
                    disconnectedUserId = userId;
                    connectedUsers.delete(userId);
                    break;
                }
            }

            if (disconnectedUserId) {
                await prisma.user.update({
                    where: { id: disconnectedUserId },
                    data: { isOnline: false }
                });
                io.emit('user_status_change', { userId: disconnectedUserId, isOnline: false });
            }
        });
    });
};

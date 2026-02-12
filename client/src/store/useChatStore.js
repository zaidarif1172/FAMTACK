import { create } from 'zustand';
import io from 'socket.io-client';
import axios from 'axios';

const SOCKET_URL = 'http://localhost:3001';
const API_URL = 'http://localhost:3001/api';

export const useChatStore = create((set, get) => ({
    socket: null,
    user: null,
    token: null,
    selectedUser: null,
    users: [],
    messages: [],
    onlineUsers: new Set(),
    typingUsers: new Set(),
    isTyping: false,

    // Call state
    incomingCall: null,
    activeCall: null,
    peerConnection: null,
    localStream: null,
    remoteStream: null,

    // Status state
    statuses: [],

    // Auth Actions
    login: async (email, password) => {
        try {
            const res = await axios.post(`${API_URL}/auth/login`, { email, password });
            set({ user: res.data.user, token: res.data.token });
            localStorage.setItem('token', res.data.token);
            get().connectSocket(res.data.user.id);
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.error || 'Login failed' };
        }
    },

    register: async (fullName, email, password) => {
        try {
            const res = await axios.post(`${API_URL}/auth/register`, { fullName, email, password });
            set({ user: res.data.user, token: res.data.token });
            localStorage.setItem('token', res.data.token);
            get().connectSocket(res.data.user.id);
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.error || 'Registration failed' };
        }
    },

    checkAuth: async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const res = await axios.get(`${API_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            set({ user: res.data.user, token });
            get().connectSocket(res.data.user.id);
        } catch (err) {
            localStorage.removeItem('token');
            set({ user: null, token: null });
        }
    },

    logout: () => {
        const { socket } = get();
        if (socket) socket.disconnect();
        localStorage.removeItem('token');
        set({ user: null, token: null, socket: null, selectedUser: null, users: [], messages: [] });
    },

    updateProfile: async (data) => {
        const { token, user } = get();
        if (!token) return { success: false };

        try {
            const res = await axios.put(`${API_URL}/auth/profile`, data, {
                headers: { Authorization: `Bearer ${token}` }
            });
            set({ user: { ...user, ...res.data.user } });
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.error || 'Update failed' };
        }
    },

    // Socket Actions
    connectSocket: (userId) => {
        const socket = io(SOCKET_URL);
        set({ socket });

        socket.emit('join', userId);

        socket.on('user_status_change', ({ userId, isOnline }) => {
            set((state) => {
                const newOnline = new Set(state.onlineUsers);
                if (isOnline) newOnline.add(userId);
                else newOnline.delete(userId);
                return { onlineUsers: newOnline };
            });
            get().fetchUsers(); // Refresh to update list UI
        });

        socket.on('receive_message', (message) => {
            const { selectedUser } = get();
            if (selectedUser && (message.senderId === selectedUser.id || message.receiverId === selectedUser.id)) {
                set((state) => ({ messages: [...state.messages, message] }));
            }
        });

        socket.on('user_typing', ({ userId }) => {
            set((state) => {
                const newTyping = new Set(state.typingUsers);
                newTyping.add(userId);
                return { typingUsers: newTyping };
            });
        });

        socket.on('user_stopped_typing', ({ userId }) => {
            set((state) => {
                const newTyping = new Set(state.typingUsers);
                newTyping.delete(userId);
                return { typingUsers: newTyping };
            });
        });

        socket.on('messages_read', ({ receiverId }) => {
            set((state) => ({
                messages: state.messages.map(msg =>
                    (msg.receiverId === receiverId && !msg.isRead) ? { ...msg, isRead: true } : msg
                )
            }));
        });

        // WebRTC Call Events
        socket.on('incoming_call', async ({ from, offer, callType }) => {
            const users = get().users;
            const caller = users.find(u => u.id === from);
            set({ incomingCall: { from, offer, callType, caller } });
        });

        socket.on('call_answered', async ({ answer }) => {
            const { peerConnection } = get();
            if (peerConnection) {
                await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
            }
        });

        socket.on('ice_candidate', async ({ candidate }) => {
            const { peerConnection } = get();
            if (peerConnection && candidate) {
                await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            }
        });

        socket.on('call_ended', () => {
            get().endCall();
        });
    },

    disconnectSocket: () => {
        const { socket } = get();
        if (socket) socket.disconnect();
        set({ socket: null });
    },

    // Chat Actions
    fetchUsers: async (search = '') => {
        const { token } = get();
        if (!token) return;
        try {
            const res = await axios.get(`${API_URL}/contacts`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            set({ users: res.data });
        } catch (err) {
            console.error(err);
        }
    },

    addContact: async (email) => {
        const { token } = get();
        if (!token) return { success: false, error: 'Not authenticated' };
        try {
            const res = await axios.post(`${API_URL}/contacts/add`,
                { email },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            get().fetchUsers();
            return { success: true, contact: res.data.contact };
        } catch (err) {
            return { success: false, error: err.response?.data?.error || 'Failed to add contact' };
        }
    },

    selectUser: async (user) => {
        set({ selectedUser: user });
        const { token, user: currentUser } = get();
        try {
            const res = await axios.get(`${API_URL}/messages/${user.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            set({ messages: res.data });
        } catch (err) {
            console.error(err);
        }
    },

    sendMessage: async (content) => {
        const { socket, selectedUser, user, messages } = get();
        if (!socket || !selectedUser) return;

        const messageData = {
            senderId: user.id,
            receiverId: selectedUser.id,
            content
        };

        socket.emit('send_message', messageData);

        // Optimistic update
        const newMessage = {
            ...messageData,
            id: Date.now(),
            createdAt: new Date().toISOString(),
            isRead: false
        };

        set({ messages: [...messages, newMessage] });
    },

    emitTyping: (receiverId) => {
        const { socket } = get();
        if (socket) socket.emit('typing', { receiverId });
    },

    emitStopTyping: (receiverId) => {
        const { socket } = get();
        if (socket) socket.emit('stop_typing', { receiverId });
    },

    markAsRead: (senderId) => {
        const { socket } = get();
        if (socket) socket.emit('read_messages', { senderId });
    },

    // WebRTC Call Functions
    startCall: async (callType) => {
        const { selectedUser, socket, user } = get();
        if (!selectedUser || !socket) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: callType === 'video',
                audio: true
            });

            set({ localStream: stream });

            const configuration = {
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
            };
            const pc = new RTCPeerConnection(configuration);

            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            pc.ontrack = (event) => {
                set({ remoteStream: event.streams[0] });
            };

            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit('ice_candidate', {
                        to: selectedUser.id,
                        candidate: event.candidate
                    });
                }
            };

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            socket.emit('call_user', {
                to: selectedUser.id,
                offer,
                callType
            });

            set({
                peerConnection: pc,
                activeCall: { type: callType, userId: selectedUser.id, isInitiator: true }
            });
        } catch (error) {
            console.error('Error starting call:', error);
            alert('Could not access camera/microphone. Please check permissions.');
        }
    },

    answerCall: async () => {
        const { incomingCall, socket, user } = get();
        if (!incomingCall) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: incomingCall.callType === 'video',
                audio: true
            });

            set({ localStream: stream });

            const configuration = {
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
            };
            const pc = new RTCPeerConnection(configuration);

            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            pc.ontrack = (event) => {
                set({ remoteStream: event.streams[0] });
            };

            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit('ice_candidate', {
                        to: incomingCall.from,
                        candidate: event.candidate
                    });
                }
            };

            await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            socket.emit('answer_call', {
                to: incomingCall.from,
                answer
            });

            set({
                peerConnection: pc,
                activeCall: { type: incomingCall.callType, userId: incomingCall.from, isInitiator: false },
                incomingCall: null
            });
        } catch (error) {
            console.error('Error answering call:', error);
            alert('Could not access camera/microphone. Please check permissions.');
        }
    },

    rejectCall: () => {
        const { incomingCall, socket } = get();
        if (incomingCall) {
            socket.emit('end_call', { to: incomingCall.from });
            set({ incomingCall: null });
        }
    },

    endCall: () => {
        const { peerConnection, localStream, activeCall, socket } = get();

        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }

        if (peerConnection) {
            peerConnection.close();
        }

        if (activeCall && socket) {
            socket.emit('end_call', { to: activeCall.userId });
        }

        set({
            peerConnection: null,
            localStream: null,
            remoteStream: null,
            activeCall: null,
            incomingCall: null
        });
    },

    // Status Functions
    fetchStatuses: async () => {
        const { token } = get();
        if (!token) return;

        try {
            const res = await axios.get(`${API_URL}/status`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            set({ statuses: res.data.statuses });
        } catch (err) {
            console.error('Failed to fetch statuses:', err);
        }
    },

    createStatus: async (data) => {
        const { token } = get();
        if (!token) return { success: false };

        try {
            await axios.post(`${API_URL}/status`, data, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.error || 'Failed to create status' };
        }
    },

    deleteStatus: async (id) => {
        const { token } = get();
        if (!token) return { success: false };

        try {
            await axios.delete(`${API_URL}/status/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.error || 'Failed to delete status' };
        }
    },
}));

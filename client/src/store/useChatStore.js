import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';

export const useChatStore = create((set, get) => ({
    user: null,
    session: null,
    selectedUser: null,
    users: [],
    messages: [],
    onlineUsers: new Set(),
    typingUsers: new Set(),

    // Auth Actions
    login: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { success: false, error: error.message };

        set({ user: data.user, session: data.session });
        get().initializeRealtime(data.user.id);
        return { success: true };
    },

    register: async (fullName, email, password) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName }
            }
        });
        if (error) return { success: false, error: error.message };

        set({ user: data.user, session: data.session });
        get().initializeRealtime(data.user.id);
        return { success: true };
    },

    checkAuth: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            set({ user: session.user, session });
            get().initializeRealtime(session.user.id);
        }
    },

    logout: async () => {
        await supabase.auth.signOut();
        set({ user: null, session: null, selectedUser: null, users: [], messages: [] });
    },

    // Realtime initialization
    initializeRealtime: (userId) => {
        // Subscribe to messages
        supabase
            .channel('public:messages')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
                const newMessage = payload.new;
                const { selectedUser, user } = get();

                if (
                    (newMessage.sender_id === userId && newMessage.receiver_id === selectedUser?.id) ||
                    (newMessage.sender_id === selectedUser?.id && newMessage.receiver_id === userId)
                ) {
                    set((state) => ({ messages: [...state.messages, newMessage] }));
                }
            })
            .subscribe();

        // Presence (Online/Offline)
        const channel = supabase.channel('online_users');
        channel
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState();
                const onlineIds = new Set(Object.values(state).flat().map(p => p.user_id));
                set({ onlineUsers: onlineIds });
            })
            .on('presence', { event: 'join' }, ({ key, newPresences }) => {
                console.log('join', key, newPresences);
            })
            .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
                console.log('leave', key, leftPresences);
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({ user_id: userId, online_at: new Date().toISOString() });
                }
            });

        get().fetchUsers();
    },

    // Chat Actions
    fetchUsers: async () => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*');

        if (!error) set({ users: data });
    },

    selectUser: async (selectedUser) => {
        set({ selectedUser });
        const { user } = get();

        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},receiver_id.eq.${user.id})`)
            .order('created_at', { ascending: true });

        if (!error) set({ messages: data });
    },

    sendMessage: async (content) => {
        const { user, selectedUser } = get();
        if (!user || !selectedUser) return;

        const { error } = await supabase
            .from('messages')
            .insert([
                {
                    content,
                    sender_id: user.id,
                    receiver_id: selectedUser.id
                }
            ]);

        if (error) console.error('Error sending message:', error);
    },

    updateProfile: async (updates) => {
        const { user } = get();
        const { error } = await supabase
            .from('profiles')
            .update({
                full_name: updates.fullName,
                avatar_url: updates.avatarUrl
            })
            .eq('id', user.id);

        if (error) return { success: false, error: error.message };

        set((state) => ({
            user: { ...state.user, user_metadata: { ...state.user.user_metadata, ...updates } }
        }));
        return { success: true };
    }
}));

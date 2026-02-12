import React, { useEffect, useState, useRef } from 'react';
import { useChatStore } from '../store/useChatStore';
import { LogOut, Search, Send, Menu, Phone, Video, MoreVertical, Check, CheckCheck, MessageSquare, UserPlus, X, Settings as SettingsIcon } from 'lucide-react';
import { format } from 'date-fns';
import Settings from './Settings';
import StatusPage from './StatusPage';

const Chat = () => {
    const { user, users, fetchUsers, selectedUser, selectUser, messages, sendMessage, logout, typingUsers, emitTyping, emitStopTyping, markAsRead, addContact, startCall, answerCall, rejectCall, endCall, incomingCall, activeCall, localStream, remoteStream } = useChatStore();
    const [msgInput, setMsgInput] = useState('');
    const [showSidebar, setShowSidebar] = useState(true);
    const [showAddContact, setShowAddContact] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showStatus, setShowStatus] = useState(false);
    const [contactEmail, setContactEmail] = useState('');
    const [addingContact, setAddingContact] = useState(false);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, typingUsers]);

    // Mark as read when messages change or user is selected
    useEffect(() => {
        if (selectedUser && messages.length > 0) {
            const lastMsg = messages[messages.length - 1];
            if (lastMsg.senderId === selectedUser.id && !lastMsg.isRead) {
                markAsRead(selectedUser.id);
            }
        }
    }, [messages, selectedUser, markAsRead]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!msgInput.trim()) return;
        sendMessage(msgInput);
        setMsgInput('');
        emitStopTyping(selectedUser.id);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };

    const handleInputChange = (e) => {
        setMsgInput(e.target.value);

        if (selectedUser) {
            emitTyping(selectedUser.id);

            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

            typingTimeoutRef.current = setTimeout(() => {
                emitStopTyping(selectedUser.id);
            }, 2000);
        }
    };

    // Attach local stream to video element
    useEffect(() => {
        if (localStream && localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    // Attach remote stream to video element
    useEffect(() => {
        if (remoteStream && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    const handleAddContact = async (e) => {
        e.preventDefault();
        if (!contactEmail.trim()) return;

        setAddingContact(true);
        const result = await addContact(contactEmail);
        setAddingContact(false);

        if (result.success) {
            setContactEmail('');
            setShowAddContact(false);
            alert(`Added ${result.contact.username} to your contacts!`);
        } else {
            alert(result.error);
        }
    };

    return (
        <div className="flex h-screen bg-slate-950 text-white overflow-hidden font-sans">
            {/* Sidebar - Users List */}
            <div className={`${showSidebar ? 'translate-x-0' : '-translate-x-full'} absolute md:relative z-20 w-full md:w-80 h-full bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 md:translate-x-0 shadow-2xl`}>
                <div className="p-4 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 flex justify-between items-center h-20">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <img src={user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`} alt="Me" className="w-11 h-11 rounded-full bg-slate-800 object-cover ring-2 ring-brand-500/20" />
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-brand-500 rounded-full border-2 border-slate-900"></span>
                        </div>
                        <div>
                            <span className="font-bold text-lg truncate max-w-[120px] block">{user?.user_metadata?.full_name || 'User'}</span>
                            <span className="text-xs text-brand-400 font-medium">Online</span>
                        </div>
                    </div>
                    <div className="flex gap-1">
                        <button
                            onClick={() => setShowStatus(true)}
                            className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-brand-400 transition-all duration-200"
                            title="Status"
                        >
                            <MessageSquare size={20} />
                        </button>
                        <button
                            onClick={() => setShowAddContact(true)}
                            className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-brand-400 transition-all duration-200"
                            title="Add Contact"
                        >
                            <UserPlus size={20} />
                        </button>
                        <button
                            onClick={() => setShowSettings(true)}
                            className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-brand-400 transition-all duration-200"
                            title="Settings"
                        >
                            <SettingsIcon size={20} />
                        </button>
                        <button onClick={logout} className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-red-400 transition-all duration-200">
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>

                {/* Add Contact Modal */}
                {showAddContact && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="glass p-6 rounded-2xl w-full max-w-sm animate-slide-up">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold">Add Contact</h3>
                                <button onClick={() => setShowAddContact(false)} className="p-1 hover:bg-slate-700 rounded-lg">
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleAddContact} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1 ml-1 uppercase tracking-wider">Email Address</label>
                                    <input
                                        type="email"
                                        value={contactEmail}
                                        onChange={(e) => setContactEmail(e.target.value)}
                                        placeholder="friend@example.com"
                                        className="w-full px-4 py-3 glass-input rounded-xl text-white outline-none"
                                        required
                                        autoFocus
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={addingContact}
                                    className="w-full bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70"
                                >
                                    {addingContact ? 'Adding...' : 'Add Contact'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                <div className="p-4">
                    <div className="relative group">
                        <Search className="absolute left-3.5 top-3 text-slate-500 w-5 h-5 group-focus-within:text-brand-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search chats..."
                            className="w-full bg-slate-800/50 text-slate-200 pl-11 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 border border-slate-700/50 focus:border-brand-500/50 transition-all placeholder:text-slate-600"
                            onChange={(e) => fetchUsers(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-2 space-y-1">
                    {users.filter(u => u.id !== user.id).map(u => (
                        <button
                            key={u.id}
                            onClick={() => {
                                selectUser(u);
                                setShowSidebar(false);
                            }}
                            className={`w-full p-3 flex items-center gap-4 rounded-xl transition-all duration-200 group ${selectedUser?.id === u.id ? 'bg-brand-500/10 border border-brand-500/20' : 'hover:bg-slate-800/50 border border-transparent'}`}
                        >
                            <div className="relative">
                                <img src={u.avatar_url} alt={u.full_name} className="w-12 h-12 rounded-full bg-slate-800 object-cover" />
                                {onlineUsers.has(u.id) && <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-brand-500 rounded-full border-2 border-slate-900 group-hover:border-slate-800 transition-colors"></span>}
                            </div>
                            <div className="text-left flex-1 min-w-0">
                                <h3 className={`font-semibold text-[15px] truncate ${selectedUser?.id === u.id ? 'text-brand-300' : 'text-slate-200 group-hover:text-white'}`}>{u.full_name}</h3>
                                {typingUsers.has(u.id) ? (
                                    <p className="text-xs text-brand-400 font-medium truncate animate-pulse">Typing...</p>
                                ) : (
                                    <p className="text-xs text-slate-500 truncate group-hover:text-slate-400 transition-colors">Click to chat</p>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-slate-950 w-full h-full relative">
                {selectedUser ? (
                    <>
                        <div className="h-20 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6 py-2 z-10 shadow-sm">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setShowSidebar(true)} className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
                                    <Menu />
                                </button>
                                <img src={selectedUser.avatar_url} alt={selectedUser.full_name} className="w-11 h-11 rounded-full bg-slate-800 object-cover ring-2 ring-slate-700" />
                                <div>
                                    <h3 className="font-bold text-lg">{selectedUser.full_name}</h3>
                                    <p className="text-xs font-medium">
                                        {typingUsers.has(selectedUser.id) ? (
                                            <span className="text-brand-400 animate-pulse">Typing...</span>
                                        ) : (
                                            onlineUsers.has(selectedUser.id) ? <span className="text-brand-500">Online</span> : <span className="text-slate-500">Offline</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => startCall('audio')} className="p-2.5 hover:bg-slate-800 rounded-xl hover:text-brand-400 transition-colors"><Phone size={20} /></button>
                                <button onClick={() => startCall('video')} className="p-2.5 hover:bg-slate-800 rounded-xl hover:text-brand-400 transition-colors"><Video size={20} /></button>
                                <button className="p-2.5 hover:bg-slate-800 rounded-xl hover:text-brand-400 transition-colors"><MoreVertical size={20} /></button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-950 relative">
                            {/* Background Pattern */}
                            <div className="absolute inset-0 opacity-[0.03]" style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                            }}></div>

                            <div className="relative z-10 flex flex-col gap-3 max-w-5xl mx-auto">
                                <div className="text-center text-xs text-slate-600 my-4 font-medium uppercase tracking-widest relative">
                                    <span className="bg-slate-950 px-3 relative z-10">Today</span>
                                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
                                </div>

                                {messages.map((msg, idx) => {
                                    const isMe = msg.sender_id === user.id;
                                    return (
                                        <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in group`}>
                                            <div className={`max-w-[80%] md:max-w-[65%] px-5 py-3 rounded-2xl text-[15px] shadow-sm relative ${isMe
                                                ? 'bg-gradient-to-br from-brand-600 to-brand-700 text-white rounded-br-none shadow-brand-900/20'
                                                : 'bg-slate-800 text-slate-200 rounded-bl-none shadow-md border border-slate-700/50'
                                                }`}>
                                                <p className="leading-relaxed">{msg.content}</p>
                                                <div className={`text-[10px] opacity-70 flex justify-end items-center gap-1.5 mt-1.5 font-medium`}>
                                                    <span>{format(new Date(msg.created_at), 'HH:mm')}</span>
                                                    {isMe && (
                                                        <span className={msg.is_read ? "text-brand-200" : ""}>
                                                            {msg.is_read ? <CheckCheck size={14} /> : <Check size={14} />}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-slate-950/80 backdrop-blur-sm relative z-20">
                            <div className="max-w-4xl mx-auto bg-slate-900 p-2 rounded-full border border-slate-800 flex items-center gap-2 shadow-lg hover:border-slate-700 transition-colors">
                                <input
                                    value={msgInput}
                                    onChange={handleInputChange}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend(e)}
                                    type="text"
                                    placeholder="Type a message..."
                                    className="flex-1 bg-transparent text-white px-5 py-3 text-sm focus:outline-none placeholder:text-slate-500"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!msgInput.trim()}
                                    className="p-3 bg-brand-500 hover:bg-brand-600 disabled:bg-slate-800 disabled:text-slate-600 rounded-full text-white transition-all duration-200 hover:shadow-lg hover:shadow-brand-500/25 active:scale-95 transform"
                                >
                                    <Send size={18} className={msgInput.trim() ? "ml-0.5" : ""} />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black z-0"></div>
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-28 h-28 bg-slate-900 rounded-3xl flex items-center justify-center mb-8 border border-slate-800 shadow-2xl shadow-black/50 animate-fade-in relative">
                                <div className="absolute inset-0 bg-brand-500/10 rounded-3xl blur-xl"></div>
                                <MessageSquare className="w-14 h-14 text-brand-500 relative z-10" />
                            </div>
                            <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">FamTalk</h2>
                            <p className="max-w-md text-slate-400 text-lg leading-relaxed">
                                Select a chat to start messaging. Secure, fast, and beautiful conversations await.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Incoming Call Modal */}
            {incomingCall && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center">
                    <div className="glass p-8 rounded-3xl text-center max-w-sm w-full mx-4 animate-slide-up">
                        <div className="mb-6">
                            <img
                                src={incomingCall.caller?.avatarUrl}
                                alt={incomingCall.caller?.fullName || incomingCall.caller?.username}
                                className="w-24 h-24 rounded-full mx-auto mb-4 ring-4 ring-brand-500/50"
                            />
                            <h3 className="text-2xl font-bold mb-2">{incomingCall.caller?.fullName || incomingCall.caller?.username}</h3>
                            <p className="text-slate-400">
                                Incoming {incomingCall.callType === 'video' ? 'Video' : 'Voice'} Call
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={rejectCall}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-xl transition-all"
                            >
                                Decline
                            </button>
                            <button
                                onClick={answerCall}
                                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl transition-all"
                            >
                                Answer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Active Call Overlay */}
            {activeCall && (
                <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col">
                    <div className="flex-1 relative">
                        {/* Remote Video (Full Screen) */}
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                        />

                        {/* Local Video (Picture-in-Picture) */}
                        {activeCall.type === 'video' && (
                            <div className="absolute top-4 right-4 w-48 h-36 rounded-xl overflow-hidden shadow-2xl border-2 border-slate-700">
                                <video
                                    ref={localVideoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        {/* Call Info */}
                        <div className="absolute top-4 left-4 glass px-4 py-2 rounded-xl">
                            <p className="text-sm font-medium">
                                {activeCall.type === 'video' ? 'Video' : 'Voice'} Call
                            </p>
                        </div>

                        {/* End Call Button */}
                        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                            <button
                                onClick={endCall}
                                className="bg-red-500 hover:bg-red-600 text-white p-6 rounded-full shadow-2xl transition-all hover:scale-110"
                            >
                                <Phone size={28} className="rotate-135" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Settings Modal */}
            {showSettings && <Settings onClose={() => setShowSettings(false)} />}

            {/* Status Page */}
            {showStatus && <StatusPage onClose={() => setShowStatus(false)} />}
        </div>
    );
};

export default Chat;

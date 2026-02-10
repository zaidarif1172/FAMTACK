import React, { useState, useEffect } from 'react';
import { useChatStore } from '../store/useChatStore';
import { X, Plus, Image as ImageIcon, Type, Trash2, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const Status = ({ onClose }) => {
    const { user, fetchStatuses, createStatus, deleteStatus, statuses } = useChatStore();
    const [showCreate, setShowCreate] = useState(false);
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [posting, setPosting] = useState(false);

    useEffect(() => {
        fetchStatuses();
    }, [fetchStatuses]);

    const handlePost = async () => {
        if (!content.trim() && !imageUrl.trim()) return;

        setPosting(true);
        const result = await createStatus({ content, imageUrl });
        setPosting(false);

        if (result.success) {
            setContent('');
            setImageUrl('');
            setShowCreate(false);
            // Refresh statuses after posting
            await fetchStatuses();
        } else {
            alert(result.error || 'Failed to post status');
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Delete this status?')) {
            await deleteStatus(id);
            setSelectedStatus(null);
            fetchStatuses();
        }
    };

    const generateRandomImage = () => {
        const seed = Math.random().toString(36).substring(7);
        setImageUrl(`https://picsum.photos/seed/${seed}/800/600`);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setImageUrl(reader.result); // Base64 data URL
        };
        reader.readAsDataURL(file);
    };

    // Group statuses by user
    const groupedStatuses = statuses.reduce((acc, status) => {
        const userId = status.user.id;
        if (!acc[userId]) {
            acc[userId] = {
                user: status.user,
                statuses: []
            };
        }
        acc[userId].statuses.push(status);
        return acc;
    }, {});

    const statusGroups = Object.values(groupedStatuses);

    return (
        <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col">
            {/* Header */}
            <div className="glass p-4 flex justify-between items-center border-b border-slate-700/50">
                <h2 className="text-2xl font-bold">Status</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowCreate(true)}
                        className="p-2.5 bg-brand-500 hover:bg-brand-600 rounded-xl transition-colors"
                        title="Add Status"
                    >
                        <Plus size={20} />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2.5 hover:bg-slate-800 rounded-xl transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>
            </div>

            {/* Status Grid */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
                    {statusGroups.map((group) => (
                        <button
                            key={group.user.id}
                            onClick={() => setSelectedStatus(group)}
                            className="relative aspect-[9/16] rounded-2xl overflow-hidden group hover:scale-105 transition-transform"
                        >
                            {/* Background */}
                            {group.statuses[0].imageUrl ? (
                                <img
                                    src={group.statuses[0].imageUrl}
                                    alt="Status"
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center p-4">
                                    <p className="text-white text-center font-medium line-clamp-6">
                                        {group.statuses[0].content}
                                    </p>
                                </div>
                            )}

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />

                            {/* User Info */}
                            <div className="absolute top-3 left-3 flex items-center gap-2">
                                <img
                                    src={group.user.avatarUrl}
                                    alt={group.user.username}
                                    className="w-10 h-10 rounded-full ring-2 ring-white/50"
                                />
                                <div className="text-left">
                                    <p className="text-white font-bold text-sm">{group.user.username}</p>
                                    <p className="text-white/80 text-xs">
                                        {formatDistanceToNow(new Date(group.statuses[0].createdAt), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>

                            {/* Status Count */}
                            {group.statuses.length > 1 && (
                                <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-white">
                                    {group.statuses.length} updates
                                </div>
                            )}
                        </button>
                    ))}

                    {statusGroups.length === 0 && (
                        <div className="col-span-full text-center py-20 text-slate-400">
                            <Clock size={48} className="mx-auto mb-4 opacity-50" />
                            <p>No statuses yet</p>
                            <p className="text-sm mt-2">Be the first to share!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Status Modal */}
            {showCreate && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="glass rounded-3xl w-full max-w-lg animate-slide-up">
                        <div className="p-6 border-b border-slate-700/50 flex justify-between items-center">
                            <h3 className="text-xl font-bold">Create Status</h3>
                            <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-slate-700 rounded-xl">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-2 ml-1 uppercase tracking-wider flex items-center gap-2">
                                    <Type size={16} /> Text
                                </label>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="w-full px-4 py-3 glass-input rounded-xl text-white outline-none resize-none"
                                    placeholder="What's on your mind?"
                                    rows={4}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-2 ml-1 uppercase tracking-wider flex items-center gap-2">
                                    <ImageIcon size={16} /> Image
                                </label>

                                <div className="flex gap-2">
                                    <label className="flex-1 px-4 py-3 glass-input rounded-xl text-white cursor-pointer hover:border-brand-500/50 transition-all flex items-center justify-center gap-2">
                                        <ImageIcon size={18} />
                                        <span>Choose from PC</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                    </label>
                                    <button
                                        onClick={generateRandomImage}
                                        className="px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-medium transition-colors whitespace-nowrap"
                                    >
                                        Random
                                    </button>
                                </div>

                                <input
                                    type="text"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    className="w-full px-4 py-3 glass-input rounded-xl text-white outline-none mt-2"
                                    placeholder="Or paste image URL"
                                />
                            </div>

                            {imageUrl && (
                                <div className="rounded-xl overflow-hidden">
                                    <img src={imageUrl} alt="Preview" className="w-full h-48 object-cover" />
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-slate-700/50 flex gap-3">
                            <button
                                onClick={() => setShowCreate(false)}
                                className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePost}
                                disabled={posting || (!content.trim() && !imageUrl.trim())}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 disabled:from-slate-600 disabled:to-slate-700 rounded-xl font-medium transition-all disabled:cursor-not-allowed"
                            >
                                {posting ? 'Posting...' : 'Post Status'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Status Modal */}
            {selectedStatus && (
                <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
                    <button
                        onClick={() => setSelectedStatus(null)}
                        className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors z-10"
                    >
                        <X size={24} />
                    </button>

                    <div className="relative w-full max-w-md aspect-[9/16]">
                        {selectedStatus.statuses.map((status, idx) => (
                            <div key={status.id} className={idx === 0 ? 'block' : 'hidden'}>
                                {status.imageUrl ? (
                                    <img
                                        src={status.imageUrl}
                                        alt="Status"
                                        className="w-full h-full object-cover rounded-2xl"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl flex items-center justify-center p-8">
                                        <p className="text-white text-2xl text-center font-medium">
                                            {status.content}
                                        </p>
                                    </div>
                                )}

                                {/* User Info Overlay */}
                                <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent rounded-t-2xl">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={status.user.avatarUrl}
                                                alt={status.user.username}
                                                className="w-12 h-12 rounded-full ring-2 ring-white/50"
                                            />
                                            <div>
                                                <p className="text-white font-bold">{status.user.username}</p>
                                                <p className="text-white/80 text-sm">
                                                    {formatDistanceToNow(new Date(status.createdAt), { addSuffix: true })}
                                                </p>
                                            </div>
                                        </div>

                                        {status.userId === user?.id && (
                                            <button
                                                onClick={() => handleDelete(status.id)}
                                                className="p-2 bg-red-500/80 hover:bg-red-600 rounded-full transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Status;

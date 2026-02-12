import React, { useState } from 'react';
import { useChatStore } from '../store/useChatStore';
import { X, Camera, User, Mail, Lock, LogOut, Save } from 'lucide-react';

const Settings = ({ onClose }) => {
    const { user, logout, updateProfile } = useChatStore();
    const [fullName, setFullName] = useState(user?.fullName || '');
    const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        await updateProfile({ fullName, avatarUrl });
        setSaving(false);
        alert('Profile updated successfully!');
    };

    const generateRandomAvatar = () => {
        const seed = Math.random().toString(36).substring(7);
        setAvatarUrl(`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`);
    };

    const handleAvatarUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarUrl(reader.result);
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="glass rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-slide-up">
                {/* Header */}
                <div className="p-6 border-b border-slate-700/50 flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Settings</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-700 rounded-xl transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    {/* Profile Section */}
                    <div className="mb-8">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <User size={20} className="text-brand-400" />
                            Profile
                        </h3>

                        {/* Avatar */}
                        <div className="flex items-center gap-6 mb-6">
                            <div className="relative group">
                                <img
                                    src={avatarUrl}
                                    alt="Avatar"
                                    className="w-24 h-24 rounded-full ring-4 ring-brand-500/20"
                                />
                                <button
                                    onClick={generateRandomAvatar}
                                    className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Camera size={24} />
                                </button>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-slate-400 mb-2">Profile Picture</p>
                                <div className="flex gap-2">
                                    <label className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors cursor-pointer">
                                        Upload from PC
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarUpload}
                                            className="hidden"
                                        />
                                    </label>
                                    <button
                                        onClick={generateRandomAvatar}
                                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        Random
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Full Name */}
                        <div className="mb-4">
                            <label className="block text-xs font-medium text-slate-400 mb-2 ml-1 uppercase tracking-wider">
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full px-4 py-3 glass-input rounded-xl text-white outline-none"
                                placeholder="Your full name"
                            />
                        </div>

                        {/* Email (Read-only) */}
                        <div className="mb-4">
                            <label className="block text-xs font-medium text-slate-400 mb-2 ml-1 uppercase tracking-wider">
                                Email
                            </label>
                            <div className="w-full px-4 py-3 glass-input rounded-xl text-slate-500 flex items-center gap-2">
                                <Mail size={18} />
                                {user?.email}
                            </div>
                            <p className="text-xs text-slate-500 mt-1 ml-1">Email cannot be changed</p>
                        </div>
                    </div>

                    {/* Account Section */}
                    <div className="mb-8">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Lock size={20} className="text-brand-400" />
                            Account
                        </h3>

                        <div className="space-y-3">
                            <div className="p-4 glass-input rounded-xl flex justify-between items-center">
                                <div>
                                    <p className="font-medium">Account Status</p>
                                    <p className="text-sm text-slate-400">Active</p>
                                </div>
                                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium">
                                    Online
                                </span>
                            </div>

                            <button
                                onClick={logout}
                                className="w-full p-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl flex items-center justify-center gap-2 text-red-400 font-medium transition-colors"
                            >
                                <LogOut size={20} />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-700/50 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 disabled:from-slate-600 disabled:to-slate-700 rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <>
                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={20} />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;

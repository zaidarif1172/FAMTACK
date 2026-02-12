import React, { useState } from 'react';
import { useChatStore } from '../store/useChatStore';
import { MessageSquare, Loader2 } from 'lucide-react';

const AuthWrapper = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: ''
    });
    const { login, register } = useChatStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        let res;
        if (isLogin) {
            res = await login(formData.email, formData.password);
        } else {
            res = await register(formData.fullName, formData.email, formData.password);
        }
        setLoading(false);

        if (!res.success) {
            alert(res.error);
        }
    };

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0a] to-black flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-500/10 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px] animate-pulse delay-1000"></div>

            <div className="glass p-8 rounded-2xl w-full max-w-md animate-slide-up relative z-10">
                <div className="flex flex-col items-center mb-8">
                    <div className="text-center mb-8 animate-fade-in">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl mb-4 shadow-lg shadow-brand-500/25">
                            <MessageSquare size={32} className="text-white" />
                        </div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-brand-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                            FamTalk
                        </h1>
                        <p className="text-slate-400 text-sm">Connect with your loved ones</p>
                    </div>
                    <p className="text-slate-400 mt-2 text-sm uppercase tracking-wider font-medium">
                        {isLogin ? 'Welcome back!' : 'Join the conversation'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {!isLogin && (
                        <div className="animate-fade-in">
                            <label className="block text-xs font-medium text-slate-400 mb-1 ml-1 uppercase tracking-wider">Full Name</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 glass-input rounded-xl text-white outline-none"
                                placeholder="John Doe"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                required
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1 ml-1 uppercase tracking-wider">Email</label>
                        <input
                            type="email"
                            className="w-full px-4 py-3 glass-input rounded-xl text-white outline-none"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1 ml-1 uppercase tracking-wider">Password</label>
                        <input
                            type="password"
                            className="w-full px-4 py-3 glass-input rounded-xl text-white outline-none"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 disabled:from-slate-600 disabled:to-slate-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transform hover:-translate-y-0.5 transition-all duration-200 disabled:transform-none disabled:shadow-none disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {isLogin ? 'Signing in...' : 'Creating account...'}
                            </span>
                        ) : (
                            isLogin ? 'Sign In' : 'Sign Up'
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-slate-400 text-sm">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="ml-2 text-brand-400 hover:text-brand-300 font-medium transition-colors"
                        >
                            {isLogin ? 'Create account' : 'Sign in'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthWrapper;

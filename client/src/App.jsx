import React, { useEffect } from 'react';
import { useChatStore } from './store/useChatStore';
import { Loader2 } from 'lucide-react';
import AuthWrapper from './pages/AuthWrapper';
import Chat from './pages/Chat';

const App = () => {
  const { user, checkAuth } = useChatStore();
  const [checking, setChecking] = React.useState(true);

  useEffect(() => {
    checkAuth().finally(() => setChecking(false));
  }, [checkAuth]);

  if (checking) {
    return (
      <div className="h-screen w-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
      </div>
    );
  }

  return user ? <Chat /> : <AuthWrapper />;
};

export default App;

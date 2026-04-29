import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, Ghost, ChevronRight, Info } from 'lucide-react';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password authentication is not enabled. Please use Google Sign-In instead.');
      } else {
        setError('Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 max-w-md w-full border border-slate-100"
      >
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-teal-100 rotate-3">
             <Ghost className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold font-display">Welcome Back</h1>
          <p className="text-slate-500 mt-2">Log in to continue your learning journey</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm flex flex-col gap-2">
             <div className="flex items-center">
                <Info className="w-4 h-4 mr-2" />
                <span>Authentication Error</span>
             </div>
             <p className="opacity-80 leading-relaxed">
               {error.includes('operation-not-allowed') 
                 ? 'Email/Password login is not enabled in the Firebase Console. Please use Google Sign-In or enable "Email/Password" in Auth > Sign-in method.' 
                 : error}
             </p>
          </div>
        )}

        <div className="mb-8">
           <button 
             onClick={handleGoogleLogin}
             disabled={loading}
             className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center space-x-3 shadow-xl shadow-slate-100"
           >
             <svg className="w-5 h-5" viewBox="0 0 24 24">
               <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor"/>
               <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor" opacity="0.8"/>
             </svg>
             <span>Continue with Google</span>
           </button>

           <div className="relative my-8">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-4 text-slate-400 font-medium">Or use email</span></div>
           </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                placeholder="email@example.com"
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-2">
               <label className="text-sm font-bold">Password</label>
               <Link to="/auth/forgot-password" size="sm" className="text-xs text-teal-600 font-bold hover:underline">Forgot password?</Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-teal-500 outline-none transition-all"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 text-white font-bold py-4 rounded-xl hover:bg-teal-700 transition-all shadow-lg shadow-teal-100 flex items-center justify-center disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Log In'}
            {!loading && <ChevronRight className="w-5 h-5 ml-2" />}
          </button>
        </form>

        <div className="mt-10 text-center pb-2">
           <p className="text-slate-500 text-sm">
             Don't have an account? <Link to="/auth/role-selection" className="text-teal-600 font-bold hover:underline">Sign up for free</Link>
           </p>
        </div>
      </motion.div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Mail, Lock, User, Calendar, GraduationCap, Phone, Info } from 'lucide-react';
import { auth, db, googleProvider } from '../lib/firebase';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, User as FirebaseUser } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';

export default function Onboarding() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const role = searchParams.get('role') || 'student';
  
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    grade: '',
    parentName: '',
    relationship: 'Parent',
    parentPhone: '',
    email: '',
    password: '',
    confirmPassword: '',
    teacherSkip: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updateData = (fields: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...fields }));
  };

  const steps = [
    { id: 'details', title: 'Student Details', path: 'details' },
    { id: 'parent', title: 'Parent/Guardian Details', path: 'parent' },
    { id: 'teacher', title: 'Teacher Details (Optional)', path: 'teacher' },
    { id: 'account', title: 'Account Setup', path: 'account' },
  ];

  const currentStepIndex = steps.findIndex(s => location.pathname.includes(s.path));

  const saveUserProfile = async (user: FirebaseUser, email: string) => {
    await setDoc(doc(db, 'users', user.uid), {
      userId: user.uid,
      email: email,
      role: role,
      firstName: formData.name.split(' ')[0] || user.displayName?.split(' ')[0] || '',
      lastName: formData.name.split(' ').slice(1).join(' ') || user.displayName?.split(' ').slice(1).join(' ') || '',
      birthDate: formData.birthDate,
      grade: formData.grade,
      parentInfo: role === 'student' ? {
        name: formData.parentName,
        relationship: formData.relationship,
        phone: formData.parentPhone,
      } : null,
      onboardingStep: 1,
      isVerified: false,
      tokens: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const handleRegister = async () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      
      await updateProfile(user, { displayName: formData.name });
      await saveUserProfile(user, formData.email);
      
      navigate('/auth/register/success');
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password registration is not enabled. Please use Google Sign-In instead.');
      } else {
        setError(err.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setLoading(true);
    setError('');
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;
      
      await saveUserProfile(user, user.email || '');
      
      navigate('/auth/register/success');
    } catch (err: any) {
      setError(err.message || 'Google registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col p-6 sm:p-12 transition-colors duration-500 ${
      role === 'student' ? 'gradient-bg' : role === 'parent' ? 'gradient-bg-purple' : 'gradient-bg-orange'
    }`}>
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between mb-12">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-slate-600 hover:text-slate-900"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back
        </button>
        
        <div className="flex-1 px-8 hidden sm:block">
           <div className="flex justify-between mb-2">
             <span className="text-sm font-bold text-teal-600">Step {currentStepIndex + 1} of 4</span>
             <span className="text-sm text-slate-400">{steps[currentStepIndex]?.title}</span>
           </div>
           <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
             <motion.div 
               className="h-full bg-teal-500"
               initial={{ width: 0 }}
               animate={{ width: `${((currentStepIndex + 1) / 4) * 100}%` }}
             />
           </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-12 max-w-xl w-full border border-slate-100">
          <AnimatePresence mode="wait">
            <Routes location={location}>
              <Route path="details" element={
                <motion.div
                  key="details"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h2 className="text-3xl font-bold mb-2">Tell us about you!</h2>
                  <p className="text-slate-500 mb-8">We'll use this to personalize your learning experience</p>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold mb-2">What's your name?</label>
                      <input 
                        type="text"
                        value={formData.name}
                        onChange={e => updateData({ name: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 outline-none"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2">When were you born?</label>
                      <input 
                        type="date"
                        value={formData.birthDate}
                        onChange={e => updateData({ birthDate: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2">What grade are you in? (Optional)</label>
                      <select 
                        value={formData.grade}
                        onChange={e => updateData({ grade: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 outline-none"
                      >
                        <option value="">Select Grade</option>
                        <option value="1st Grade">1st Grade</option>
                        <option value="2nd Grade">2nd Grade</option>
                        <option value="3rd Grade">3rd Grade</option>
                        <option value="4th Grade">4th Grade</option>
                        <option value="5th Grade">5th Grade</option>
                      </select>
                    </div>
                    
                    <button 
                      onClick={() => navigate(`/auth/register/parent?role=${role}`)}
                      className="w-full bg-teal-600 text-white font-bold py-4 rounded-xl hover:bg-teal-700 transition-colors flex items-center justify-center mt-4"
                    >
                      Next
                      <ChevronLeft className="w-5 h-5 ml-2 rotate-180" />
                    </button>
                  </div>
                </motion.div>
              } />

              <Route path="parent" element={
                <motion.div
                  key="parent"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h2 className="text-3xl font-bold mb-2">Parent or Guardian Info</h2>
                  <p className="text-slate-500 mb-8">We'll use this to send you progress updates</p>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold mb-2">Your name</label>
                      <input 
                        type="text"
                        value={formData.parentName}
                        onChange={e => updateData({ parentName: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2">Your relationship to the student</label>
                      <select 
                        value={formData.relationship}
                        onChange={e => updateData({ relationship: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none"
                      >
                        <option value="Parent">Parent</option>
                        <option value="Guardian">Guardian</option>
                        <option value="Grandparent">Grandparent</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2">Phone number (Optional)</label>
                      <input 
                        type="tel"
                        value={formData.parentPhone}
                        onChange={e => updateData({ parentPhone: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    
                    <button 
                      onClick={() => navigate(`/auth/register/teacher?role=${role}`)}
                      className="w-full bg-purple-600 text-white font-bold py-4 rounded-xl hover:bg-purple-700 transition-colors flex items-center justify-center mt-4 shadow-lg shadow-purple-200"
                    >
                      Next
                      <ChevronLeft className="w-5 h-5 ml-2 rotate-180" />
                    </button>
                  </div>
                </motion.div>
              } />

              <Route path="teacher" element={
                 <motion.div
                   key="teacher"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   className="text-center"
                 >
                   <h2 className="text-3xl font-bold mb-2">Teacher or Therapist?</h2>
                   <p className="text-slate-500 mb-8">Invite your educator to track progress together (optional)</p>
                   
                   <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8 flex items-center justify-between">
                      <div className="flex items-center text-slate-800 font-medium">
                         <div className={`w-12 h-6 rounded-full mr-4 relative transition-colors ${formData.teacherSkip ? 'bg-slate-300' : 'bg-orange-500'}`}>
                            <motion.div 
                               animate={{ x: formData.teacherSkip ? 4 : 24 }}
                               className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                            />
                         </div>
                         Skip for now
                      </div>
                      <input 
                        type="checkbox"
                        checked={formData.teacherSkip}
                        onChange={e => updateData({ teacherSkip: e.target.checked })}
                        className="hidden"
                      />
                   </div>
                   
                   <button 
                      onClick={() => navigate(`/auth/register/account?role=${role}`)}
                      className="w-full bg-orange-600 text-white font-bold py-4 rounded-xl hover:bg-orange-700 transition-colors flex items-center justify-center shadow-lg shadow-orange-200"
                    >
                      Next
                      <ChevronLeft className="w-5 h-5 ml-2 rotate-180" />
                    </button>
                 </motion.div>
              } />

              <Route path="account" element={
                <motion.div
                  key="account"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h2 className="text-3xl font-bold mb-2">Create Your Account</h2>
                  <p className="text-slate-500 mb-8">Set up your login credentials</p>
                  
                  {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm flex flex-col gap-2">
                       <div className="flex items-center">
                          <Info className="w-4 h-4 mr-2" />
                          <span>Authentication Error</span>
                       </div>
                       <p className="opacity-80 leading-relaxed">
                         {error.includes('operation-not-allowed') 
                           ? 'Email/Password registration is not enabled in the Firebase Console. Please use Google Sign-In or enable "Email/Password" in Auth > Sign-in method.' 
                           : error}
                       </p>
                    </div>
                  )}

                  <div className="mb-8">
                    <button 
                      onClick={handleGoogleRegister}
                      disabled={loading}
                      className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center space-x-3 shadow-xl shadow-slate-100 disabled:opacity-50"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor" opacity="0.8"/>
                      </svg>
                      <span>Sign up with Google</span>
                    </button>

                    <div className="relative my-8">
                       <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                       <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-4 text-slate-400 font-medium">Or use email</span></div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold mb-2">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                          type="email"
                          value={formData.email}
                          onChange={e => updateData({ email: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-teal-500 outline-none"
                          placeholder="thanjananavya@gmail.com"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                          type="password"
                          value={formData.password}
                          onChange={e => updateData({ password: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-teal-500 outline-none"
                        />
                      </div>
                      <p className="text-xs text-slate-400 mt-2">Must be at least 8 characters long</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2">Confirm Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                          type="password"
                          value={formData.confirmPassword}
                          onChange={e => updateData({ confirmPassword: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-teal-500 outline-none"
                        />
                      </div>
                    </div>
                    
                    <button 
                      onClick={handleRegister}
                      disabled={loading}
                      className="w-full bg-teal-600 text-white font-bold py-4 rounded-xl hover:bg-teal-700 transition-colors flex items-center justify-center mt-4 disabled:opacity-50"
                    >
                      {loading ? 'Creating Account...' : 'Create Account with Email'}
                      {!loading && <ChevronLeft className="w-5 h-5 ml-2 rotate-180" />}
                    </button>
                  </div>
                </motion.div>
              } />

              <Route path="success" element={
                 <motion.div
                   key="success"
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="text-center"
                 >
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                       <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', damping: 10 }}
                       >
                          <svg className="w-10 h-10 fill-current" viewBox="0 0 24 24">
                             <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                          </svg>
                       </motion.div>
                    </div>
                    
                    <h2 className="text-3xl font-bold mb-4">Welcome to LearnMate!</h2>
                    <p className="text-slate-600 mb-8 max-w-sm mx-auto">Your account has been created successfully. Let's get to know you better with a quick assessment.</p>
                    
                    <div className="space-y-4 mb-8">
                       {[
                         { title: 'Personalized Experience', desc: 'Your learning style will be detected through fun games' },
                         { title: 'Safe & Supportive', desc: 'Designed with neurodivergent learners in mind' },
                         { title: 'Progress Tracking', desc: 'Parents and teachers can monitor your growth' },
                       ].map((item, i) => (
                         <div key={i} className="flex items-start text-left bg-slate-50 border border-slate-100 rounded-2xl p-4">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center mr-4 flex-shrink-0 text-teal-600 shadow-sm">
                               <Info className="w-4 h-4" />
                            </div>
                            <div>
                               <h3 className="font-bold text-slate-800">{item.title}</h3>
                               <p className="text-slate-500 text-sm">{item.desc}</p>
                            </div>
                         </div>
                       ))}
                    </div>
                    
                    <div className="space-y-3">
                      <button 
                        onClick={() => navigate('/assessment/intro')}
                        className="w-full bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-100"
                      >
                        Start Assessment →
                      </button>
                      <button 
                        onClick={() => navigate('/dashboard')}
                        className="w-full bg-slate-100 text-slate-600 font-bold py-4 rounded-xl hover:bg-slate-200 transition-colors"
                      >
                        Skip for Now
                      </button>
                    </div>
                 </motion.div>
              } />
            </Routes>
          </AnimatePresence>
        </div>
      </main>
      
      <footer className="mt-8 text-center">
         <p className="text-slate-400 text-xs">You can complete the assessment anytime from your dashboard</p>
      </footer>
    </div>
  );
}

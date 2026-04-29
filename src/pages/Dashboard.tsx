import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, BookOpen, Trophy, Settings, Ghost, 
  Search, Bell, LogOut, ChevronRight, Play, 
  Clock, Flame, Star, Coffee, Zap, MessageCircle
} from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [adhdMode, setAdhdMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged(async (u) => {
      if (u) {
        const docRef = doc(db, 'users', u.uid);
        const unsubDoc = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            setUser(docSnap.data());
          }
        });
        return () => unsubDoc();
      } else {
        navigate('/auth/login');
      }
    });

    return () => unsubAuth();
  }, [navigate]);

  const handleLogout = () => {
    auth.signOut();
    navigate('/auth/login');
  };

  if (!user) return (
    <div className="h-screen w-screen flex items-center justify-center gradient-bg">
      <motion.div 
        animate={{ scale: [1, 1.1, 1] }} 
        transition={{ repeat: Infinity, duration: 2 }}
        className="w-16 h-16 bg-teal-600 rounded-2xl"
      />
    </div>
  );

  return (
    <div className={`min-h-screen flex ${adhdMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'} transition-colors duration-500`}>
      {/* Sidebar */}
      {!adhdMode && (
        <motion.aside 
          initial={false}
          animate={{ width: sidebarOpen ? 280 : 80 }}
          className="hidden md:flex flex-col bg-white border-r border-slate-100 p-6 sticky top-0 h-screen"
        >
          <div className="flex items-center space-x-3 mb-12">
             <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white">
                <Ghost className="w-6 h-6" />
             </div>
             {sidebarOpen && <h1 className="text-2xl font-display font-bold">LearnMate</h1>}
          </div>

          <nav className="flex-1 space-y-2">
             {[
               { icon: Home, label: 'Dashboard', active: true },
               { icon: BookOpen, label: 'My Lessons' },
               { icon: Trophy, label: 'Quests' },
               { icon: MessageCircle, label: 'Therapist' },
               { icon: Settings, label: 'Settings' },
             ].map((item, i) => (
               <button 
                 key={i}
                 className={`w-full flex items-center p-3 rounded-xl transition-all ${
                   item.active 
                    ? 'bg-teal-50 text-teal-700 font-bold' 
                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                 }`}
               >
                 <item.icon className={`w-5 h-5 ${sidebarOpen ? 'mr-3' : 'mx-auto'}`} />
                 {sidebarOpen && <span>{item.label}</span>}
               </button>
             ))}
          </nav>

          <button 
            onClick={handleLogout}
            className="flex items-center text-red-400 hover:text-red-600 p-3 mt-auto"
          >
            <LogOut className={`w-5 h-5 ${sidebarOpen ? 'mr-3' : 'mx-auto'}`} />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </motion.aside>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-6 md:p-12 max-w-7xl mx-auto w-full">
         <header className="flex flex-col md:flex-row md:items-center justify-between mb-12">
            <div>
               <h2 className="text-3xl font-bold mb-2">Welcome Back, {user.firstName}! 👋</h2>
               <p className={`${adhdMode ? 'text-slate-400' : 'text-slate-500'}`}>You've already earned <span className="text-orange-500 font-bold">120 tokens</span> this week!</p>
            </div>

            <div className="flex items-center space-x-4 mt-6 md:mt-0">
               {/* Search & Notifs */}
               {!adhdMode && (
                 <div className="flex items-center space-x-2">
                    <button className="p-3 bg-white border border-slate-100 rounded-xl hover:shadow-sm"><Search className="w-5 h-5 text-slate-400" /></button>
                    <button className="p-3 bg-white border border-slate-100 rounded-xl hover:shadow-sm"><Bell className="w-5 h-5 text-slate-400" /></button>
                 </div>
               )}

               {/* ADHD Mode Toggle */}
               <div className={`flex items-center rounded-2xl p-1 border transition-colors ${adhdMode ? 'bg-teal-600 border-teal-500' : 'bg-slate-100 border-slate-200'}`}>
                  <button 
                    onClick={() => setAdhdMode(false)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${!adhdMode ? 'bg-white shadow-sm' : 'text-teal-100'}`}
                  >
                    Classic
                  </button>
                  <button 
                    onClick={() => setAdhdMode(true)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${adhdMode ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-400'}`}
                  >
                    ADHD Mode
                  </button>
               </div>
            </div>
         </header>

         <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left Column: Progress & Tasks */}
            <div className="xl:col-span-2 space-y-8">
               
               {/* Focus Mode Warning for ADHD */}
               <AnimatePresence>
                 {adhdMode && (
                   <motion.div 
                     initial={{ opacity: 0, y: -20 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -20 }}
                     className="bg-teal-600/10 border border-teal-500/30 rounded-3xl p-6 flex items-center mb-8"
                   >
                      <Zap className="w-10 h-10 text-teal-500 mr-4" />
                      <div>
                         <h4 className="font-bold text-teal-400">Focus Mode Enabled</h4>
                         <p className="text-slate-400 text-sm">We've simplified your view so you can focus on one task at a time.</p>
                      </div>
                   </motion.div>
                 )}
               </AnimatePresence>

               {/* Main Task Card */}
               <motion.div 
                 layout
                 whileHover={{ y: -5 }}
                 className={`${adhdMode ? 'bg-slate-800' : 'bg-white shadow-xl shadow-slate-100 hover:shadow-2xl'} rounded-3xl p-8 overflow-hidden relative border ${adhdMode ? 'border-slate-700' : 'border-slate-50'} transition-all duration-300 group`}
               >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                  
                  <div className="flex justify-between items-start mb-12 relative z-10">
                     <div>
                        <span className="bg-orange-100/80 backdrop-blur-sm text-orange-600 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-4 inline-block shadow-sm">Daily Challenge</span>
                        <h3 className="text-3xl font-bold mb-2 tracking-tight group-hover:text-teal-600 transition-colors">Word Forest Maze</h3>
                        <p className={`${adhdMode ? 'text-slate-400' : 'text-slate-500'} max-w-md`}>Improve your word association while helping Sprout navigate back home safely!</p>
                     </div>
                     <div className="flex items-center space-x-2 bg-orange-50 text-orange-600 px-5 py-2.5 rounded-2xl font-bold border border-orange-100 shadow-sm">
                        <Star className="w-5 h-5 fill-current" />
                        <span>+25</span>
                     </div>
                  </div>

                  <div className={`aspect-video rounded-3xl ${adhdMode ? 'bg-slate-700' : 'bg-slate-100'} flex items-center justify-center mb-12 cursor-pointer relative overflow-hidden group/video`}>
                     <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/10 to-transparent opacity-0 group-hover/video:opacity-100 transition-opacity" />
                     <div className="w-20 h-20 bg-teal-600 rounded-full flex items-center justify-center text-white shadow-xl group-hover/video:scale-110 transition-transform relative z-10">
                        <Play className="w-8 h-8 fill-current ml-1" />
                     </div>
                     {/* Decorative pattern */}
                     <div className="absolute bottom-6 right-6 opacity-10 group-hover/video:opacity-20 transition-opacity">
                        <Ghost className="w-24 h-24 rotate-12" />
                     </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                     <div className="flex items-center space-x-4">
                        <div className="flex -space-x-3">
                           {[1, 2, 3].map(i => (
                             <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-slate-200 overflow-hidden shadow-sm">
                                <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${i + 15}`} alt="avatar" />
                             </div>
                           ))}
                        </div>
                        <div className="text-sm font-medium text-slate-400">
                           <span className="text-teal-600 font-bold">12 friends</span> are playing now
                        </div>
                     </div>
                     <button 
                       onClick={() => navigate('/lesson/word-forest')}
                       className="bg-teal-600 text-white font-bold px-10 py-4 rounded-2xl hover:bg-teal-700 transition-all shadow-lg shadow-teal-900/20 transform hover:translate-y-[-2px] active:translate-y-[0px]"
                     >
                        Start Lesson
                     </button>
                  </div>
               </motion.div>

               {/* Grid of Other Tasks (Only in Classic Mode) */}
               <AnimatePresence>
                 {!adhdMode && (
                   <motion.div 
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     className="grid grid-cols-1 md:grid-cols-2 gap-6"
                   >
                      {[
                        { title: 'Pattern Recognition', time: '5m', points: 15, color: 'bg-purple-100 text-purple-600', icon: Zap },
                        { title: 'Math Mystery', time: '10m', points: 20, color: 'bg-blue-100 text-blue-600', icon: BookOpen },
                      ].map((task, i) => (
                        <div key={i} className="bg-white border border-slate-100 rounded-3xl p-6 hover:shadow-md transition-shadow group cursor-pointer">
                           <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${task.color}`}>
                              <task.icon className="w-6 h-6" />
                           </div>
                           <h4 className="font-bold text-lg mb-4">{task.title}</h4>
                           <div className="flex items-center justify-between">
                              <div className="flex items-center text-slate-400 text-sm">
                                 <Clock className="w-4 h-4 mr-1" /> {task.time}
                              </div>
                              <span className="font-bold text-teal-600 text-sm">+{task.points} pts</span>
                           </div>
                        </div>
                      ))}
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>

            {/* Right Column: Widgets */}
            <div className="space-y-8">
               
               {/* Stats Card */}
               <div className={`${adhdMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-xl shadow-slate-100'} rounded-3xl p-8 border`}>
                  <h4 className="font-bold mb-6 flex items-center">
                     <Trophy className="w-5 h-5 text-orange-500 mr-2" />
                     Your Progress
                  </h4>
                  <div className="flex items-center justify-between mb-8">
                     <div className="text-center">
                        <div className="text-2xl font-bold flex items-center justify-center">
                           6 <Flame className="w-5 h-5 text-orange-500 ml-1" />
                        </div>
                        <div className="text-xs text-slate-400 font-medium">Day Streak</div>
                     </div>
                     <div className="w-px h-10 bg-slate-100" />
                     <div className="text-center">
                        <div className="text-2xl font-bold">1,240</div>
                        <div className="text-xs text-slate-400 font-medium">Total Tokens</div>
                     </div>
                  </div>
                  
                  <div className="space-y-4">
                     <div className="flex justify-between text-xs font-bold mb-1">
                        <span>Level 4</span>
                        <span className="text-slate-400">450 / 800 XP</span>
                     </div>
                     <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 w-[60%] rounded-full shadow-inner" />
                     </div>
                  </div>
               </div>

               {/* Break Reminder */}
               <div className={`${adhdMode ? 'bg-indigo-900/30 border-indigo-500/30' : 'bg-indigo-50 border-indigo-100'} rounded-3xl p-8 border`}>
                  <div className="flex items-center mb-4">
                     <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm mr-4">
                        <Coffee className="w-6 h-6" />
                     </div>
                     <div>
                        <h4 className="font-bold text-indigo-900">Take a Break?</h4>
                        <p className="text-indigo-600 text-xs">You've been focused for 25 mins.</p>
                     </div>
                  </div>
                  <p className="text-indigo-800/70 text-sm mb-6">Studies show a 5-minute movement break improves memory!</p>
                  <button className="w-full bg-white text-indigo-600 font-bold py-3 rounded-xl shadow-sm hover:shadow-md transition-shadow">Try a 5m Yoga Flow</button>
               </div>

               {/* Learning Profile Insight */}
               {!adhdMode && user.learningProfile && (
                 <div className="bg-teal-50 border border-teal-100 rounded-3xl p-8">
                    <h4 className="font-bold text-teal-900 mb-2">Learning Insight</h4>
                    <p className="text-teal-700 text-sm mb-6 italic">"{user.learningProfile.summary}"</p>
                    <button 
                      onClick={() => navigate('/assessment/results')}
                      className="text-teal-700 font-bold text-xs flex items-center hover:underline"
                    >
                      View Detailed Profile <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                 </div>
               )}
            </div>
         </div>
      </main>
    </div>
  );
}

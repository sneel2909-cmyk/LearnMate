import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Ghost, CheckCircle, ArrowRight, Star, Home, Brain } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';

const lessons = {
  'word-forest': {
    title: 'Word Forest Maze',
    description: 'Help Sprout find the matching words to clear the path home!',
    steps: [
      { id: 1, question: "Which word rhymes with 'CAT'?", options: ['DOG', 'BAT', 'SUN'], correct: 'BAT' },
      { id: 2, question: "What is the opposite of 'UP'?", options: ['SIDE', 'OVER', 'DOWN'], correct: 'DOWN' },
      { id: 3, question: "Find the animal that lives in water:", options: ['FISH', 'BIRD', 'LION'], correct: 'FISH' },
    ]
  }
};

export default function Lesson() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean } | null>(null);

  const lesson = lessons['word-forest']; // Default for demo

  const handleAnswer = async (answer: string) => {
    const isCorrect = answer === lesson.steps[currentStep].correct;
    if (isCorrect) setScore(s => s + 1);
    
    setFeedback({ isCorrect });
    
    setTimeout(() => {
      setFeedback(null);
      if (currentStep < lesson.steps.length - 1) {
        setCurrentStep(s => s + 1);
      } else {
        handleFinish();
      }
    }, 1500);
  };

  const handleFinish = async () => {
    const user = auth.currentUser;
    if (user) {
      await updateDoc(doc(db, 'users', user.uid), {
        tokens: increment(25),
        updatedAt: serverTimestamp()
      });
    }
    setShowResult(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col p-6 sm:p-12 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-100/30 rounded-full blur-3xl -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-100/30 rounded-full blur-3xl -ml-48 -mb-48" />

      <header className="max-w-4xl mx-auto w-full mb-12 flex items-center justify-between relative z-10">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-slate-500 hover:text-slate-800 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 transition-all hover:shadow-md"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          End Lesson
        </button>

        <div className="flex items-center bg-white px-6 py-2 rounded-full shadow-sm border border-slate-100">
           <div className="flex -space-x-1 mr-4">
              {lesson.steps.map((_, i) => (
                <div 
                  key={i} 
                  className={`w-3 h-3 rounded-full border-2 border-white ${
                    i < currentStep ? 'bg-teal-500' : i === currentStep ? 'bg-orange-400' : 'bg-slate-200'
                  }`} 
                />
              ))}
           </div>
           <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
             Step {currentStep + 1} of {lesson.steps.length}
           </span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center relative z-10">
        <div className="max-w-3xl w-full">
           <AnimatePresence mode="wait">
             {showResult ? (
               <motion.div
                 key="result"
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="bg-white rounded-[3rem] shadow-2xl p-12 text-center border border-slate-100"
               >
                  <div className="w-24 h-24 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner shadow-orange-200/50">
                     <Star className="w-12 h-12 fill-current" />
                  </div>
                  <h1 className="text-4xl font-bold mb-4">Lesson Complete!</h1>
                  <p className="text-slate-500 text-lg mb-12">Amazing work! You've successfully navigated the Word Forest.</p>
                  
                  <div className="grid grid-cols-2 gap-6 mb-12">
                     <div className="bg-slate-50 rounded-3xl p-6">
                        <div className="text-3xl font-bold text-teal-600 mb-1">{score}/{lesson.steps.length}</div>
                        <div className="text-xs font-bold text-slate-400 uppercase">Correct Answers</div>
                     </div>
                     <div className="bg-orange-50 rounded-3xl p-6">
                        <div className="text-3xl font-bold text-orange-600 mb-1">+25</div>
                        <div className="text-xs font-bold text-slate-400 uppercase">Tokens Earned</div>
                     </div>
                  </div>

                  <div className="flex gap-4">
                    <button 
                      onClick={() => navigate('/dashboard')}
                      className="flex-1 bg-teal-600 text-white font-bold py-5 rounded-2xl hover:bg-teal-700 transition-all shadow-lg shadow-teal-100 flex items-center justify-center"
                    >
                      <Home className="w-5 h-5 mr-2" />
                      Back to Dashboard
                    </button>
                    <button 
                      onClick={() => { setCurrentStep(0); setShowResult(false); setScore(0); }}
                      className="bg-slate-100 text-slate-600 font-bold px-8 rounded-2xl hover:bg-slate-200 transition-colors"
                    >
                      Play Again
                    </button>
                  </div>
               </motion.div>
             ) : (
               <motion.div
                 key="question"
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
                 className="bg-white rounded-[3rem] shadow-2xl p-12 border border-slate-100"
               >
                  <div className="flex items-center space-x-4 mb-8">
                     <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center">
                        <Brain className="w-6 h-6" />
                     </div>
                     <h2 className="text-3xl font-bold tracking-tight">{lesson.steps[currentStep].question}</h2>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                     {lesson.steps[currentStep].options.map((opt, i) => (
                       <button
                         key={i}
                         onClick={() => handleAnswer(opt)}
                         className="group flex items-center justify-between p-6 bg-slate-50 hover:bg-teal-50 border-2 border-slate-100 hover:border-teal-500 rounded-2xl transition-all active:scale-[0.98]"
                       >
                          <span className="text-xl font-bold text-slate-700 group-hover:text-teal-700">{opt}</span>
                          <div className="w-8 h-8 rounded-full border-2 border-slate-200 group-hover:border-teal-500 flex items-center justify-center transition-colors">
                             <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                          </div>
                       </button>
                     ))}
                  </div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      </main>

      {/* Feedback Overlay */}
      <AnimatePresence>
        {feedback && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className={`fixed inset-0 z-50 flex items-center justify-center scale-110 pointer-events-none`}
          >
             <div className={`px-12 py-6 rounded-full font-bold text-2xl shadow-2xl ${
               feedback.isCorrect 
                ? 'bg-green-500 text-white shadow-green-500/30' 
                : 'bg-orange-500 text-white shadow-orange-500/30'
             }`}>
               {feedback.isCorrect ? 'Correct! 🌟' : 'So close! 🌿'}
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

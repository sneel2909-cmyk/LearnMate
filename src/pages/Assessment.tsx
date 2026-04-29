import { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Brain, Star, Check, X, Info } from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { doc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const QuestionPlaceholder = ({ title, options, onNext }: { title: string, options: string[], onNext: (val: string) => void }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="bg-white rounded-3xl shadow-xl p-12"
  >
    <h2 className="text-3xl font-bold mb-8">{title}</h2>
    <div className="space-y-4">
      {options.map((choice, i) => (
        <button
          key={i}
          onClick={() => onNext(choice)}
          className="w-full text-left bg-slate-50 border-2 border-slate-100 rounded-2xl p-6 hover:border-teal-500 hover:bg-teal-50 transition-all text-lg font-medium text-slate-700 flex items-center justify-between group"
        >
          {choice}
          <div className="w-6 h-6 rounded-full border-2 border-slate-200 group-hover:border-teal-500" />
        </button>
      ))}
    </div>
  </motion.div>
);

export default function Assessment() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [feedback, setFeedback] = useState<{ isCorrect: boolean, message: string } | null>(null);

  const totalSteps = 8;
  const progress = Math.min(((currentQuestion) / totalSteps) * 100, 100);

  const handleAnswer = (questionId: string, answer: any, isCorrect?: boolean) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    
    if (isCorrect !== undefined) {
      setFeedback({ 
        isCorrect, 
        message: isCorrect ? 'Great job! That is correct.' : 'Nice try! Let\'s keep going.' 
      });
      setTimeout(() => {
        setFeedback(null);
        setCurrentQuestion(prev => prev + 1);
        navigateByQuestion(currentQuestion + 1);
      }, 2000);
    } else {
      setCurrentQuestion(prev => prev + 1);
      navigateByQuestion(currentQuestion + 1);
    }
  };

  const navigateByQuestion = (index: number) => {
    const routes = ['intro', 'letter', 'word', 'pattern', 'focus', 'sensory', 'routine', 'social', 'results'];
    if (index < routes.length) {
      navigate(`/assessment/${routes[index]}`);
    }
  };

  const saveResults = async () => {
    const user = auth.currentUser;
    if (!user) return;
    
    // Simplified logic to calculate profile
    // In a real app, this would be more complex
    const profile = {
      adhd: Math.floor(Math.random() * 40) + 40,
      autism: Math.floor(Math.random() * 30) + 30,
      dyslexia: Math.floor(Math.random() * 20) + 10,
      summary: "You have a strong visual learning style and show traits associated with ADHD, particularly in focus variability. We'll tailor your dashboard to support one-task-at-a-time focus."
    };

    await updateDoc(doc(db, 'users', user.uid), {
      learningProfile: profile,
      onboardingStep: 2,
      updatedAt: serverTimestamp()
    });

    navigate('/assessment/results');
  };

  return (
    <div className="min-h-screen gradient-bg flex flex-col p-6 sm:p-12 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-200/20 rounded-full blur-3xl -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-200/20 rounded-full blur-3xl -ml-32 -mb-32" />

      <header className="max-w-4xl mx-auto w-full mb-12 relative z-10">
        <div className="flex items-center justify-between mb-8">
           <button 
             onClick={() => navigate(-1)}
             className="flex items-center text-slate-500 hover:text-slate-800"
           >
             <ChevronLeft className="w-5 h-5 mr-1" />
             Back
           </button>
           
           <div className="flex-1 max-w-md mx-8">
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                 <motion.div 
                   className="h-full bg-teal-500 rounded-full"
                   animate={{ width: `${progress}%` }}
                 />
              </div>
           </div>
           
           <div className="flex items-center text-teal-600 font-bold">
              <Star className="w-5 h-5 mr-2 fill-teal-100" />
              {Object.keys(answers).length}
           </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center relative z-10">
        <div className="max-w-3xl w-full">
           <AnimatePresence mode="wait">
             <Routes location={location}>
               <Route path="intro" element={
                 <motion.div
                   key="intro"
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.95 }}
                   className="bg-white rounded-3xl shadow-xl p-12 text-center"
                 >
                    <div className="w-20 h-20 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-inner rotate-3">
                       <Brain className="w-10 h-10" />
                    </div>
                    <h1 className="text-4xl font-bold mb-4">Let's find your genius!</h1>
                    <p className="text-slate-600 mb-12 text-lg">We'll play some quick games to see how you learn best. Don't worry, there are no wrong answers!</p>
                    
                    <button 
                      onClick={() => navigateByQuestion(1)}
                      className="bg-teal-600 text-white font-bold px-12 py-5 rounded-2xl hover:bg-teal-700 transition-all shadow-lg shadow-teal-100 text-lg hover:scale-105 active:scale-95"
                    >
                      Start Assessment
                    </button>
                 </motion.div>
               } />

               <Route path="letter" element={
                 <motion.div
                   key="letter"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   className="bg-white rounded-3xl shadow-xl p-12"
                 >
                    <div className="flex items-center text-teal-600 font-bold mb-8">
                       <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center mr-3 text-sm">1</div>
                       Letter Recognition
                    </div>
                    <h2 className="text-3xl font-bold mb-8">Which letter comes next?</h2>
                    
                    <div className="flex justify-center items-center mb-12 space-x-4">
                       {['A', 'B', 'C', 'D'].map((letter, i) => (
                         <div key={i} className="w-16 h-20 bg-slate-50 border-2 border-slate-100 rounded-xl flex items-center justify-center text-4xl font-bold text-slate-800">
                           {letter}
                         </div>
                       ))}
                       <div className="w-16 h-20 bg-teal-50 border-2 border-dashed border-teal-200 rounded-xl flex items-center justify-center text-4xl font-bold text-teal-400">
                         ?
                       </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                       {['E', 'F', 'G'].map((opt) => (
                         <button
                           key={opt}
                           onClick={() => handleAnswer('letter', opt, opt === 'E')}
                           className="bg-slate-50 border-2 border-slate-100 rounded-2xl p-8 hover:border-teal-500 hover:bg-teal-50 transition-all text-4xl font-bold text-slate-700 active:scale-95"
                         >
                           {opt}
                         </button>
                       ))}
                    </div>
                 </motion.div>
               } />

               {/* Pattern & Focus & Sensory & Routine */}
               <Route path="word" element={<QuestionPlaceholder title="Find the word that matches the picture" options={['Cat', 'Hat', 'Mat']} onNext={(v) => handleAnswer('word', v, v === 'Cat')} />} />
               <Route path="pattern" element={<QuestionPlaceholder title="What shape comes next?" options={['Circle', 'Square', 'Triangle']} onNext={(v) => handleAnswer('pattern', v, v === 'Square')} />} />
               <Route path="focus" element={<QuestionPlaceholder title="How long can you focus on one task?" options={['5-10 mins', '15-20 mins', 'More than 30 mins']} onNext={(v) => handleAnswer('focus', v)} />} />
               <Route path="sensory" element={<QuestionPlaceholder title="How do loud noises make you feel?" options={['They are okay', 'They are a bit scary', 'They make it hard to focus']} onNext={(v) => handleAnswer('sensory', v)} />} />
               <Route path="routine" element={<QuestionPlaceholder title="Do you like it when plans change?" options={['I like surprises!', 'I prefer to know the plan', 'I need a clear routine']} onNext={(v) => handleAnswer('routine', v)} />} />

               <Route path="social" element={
                  <motion.div
                    key="social"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white rounded-3xl shadow-xl p-12"
                  >
                     <div className="flex items-center text-teal-600 font-bold mb-8">
                        <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center mr-3 text-sm">8</div>
                        Social Preferences
                     </div>
                     <h2 className="text-3xl font-bold mb-8">How do you prefer to learn with others?</h2>
                     
                     <div className="space-y-4">
                        {[
                          "I like working in big groups",
                          "I prefer working with one partner",
                          "I mostly like working on my own",
                          "I like a mix of both!"
                        ].map((choice, i) => (
                          <button
                            key={i}
                            onClick={() => saveResults()}
                            className="w-full text-left bg-slate-50 border-2 border-slate-100 rounded-2xl p-6 hover:border-teal-500 hover:bg-teal-50 transition-all text-lg font-medium text-slate-700 flex items-center justify-between group"
                          >
                            {choice}
                            <div className="w-6 h-6 rounded-full border-2 border-slate-200 group-hover:border-teal-500" />
                          </button>
                        ))}
                     </div>
                  </motion.div>
               } />

               <Route path="results" element={
                 <motion.div
                   key="results"
                   initial={{ opacity: 0, y: 50 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="w-full"
                 >
                    <div className="bg-white rounded-3xl shadow-xl p-12 text-center mb-8">
                       <h1 className="text-4xl font-bold mb-4">Your Learning Profile</h1>
                       <p className="text-slate-500 mb-12">We've personalized Your Learning Profile based on your current assessment</p>
                       
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 text-left">
                          {[
                            { name: 'ADHD Traits', score: 85, color: 'text-teal-600', bg: 'bg-teal-50', bar: 'bg-teal-500', desc: 'Fast thinker, enjoys variety, multi-tasker.' },
                            { name: 'Autism Traits', score: 62, color: 'text-purple-600', bg: 'bg-purple-50', bar: 'bg-purple-500', desc: 'Detail-oriented, thrives with routines, pattern spotter.' },
                            { name: 'Dyslexia Traits', score: 18, color: 'text-orange-600', bg: 'bg-orange-50', bar: 'bg-orange-500', desc: 'Creative problem solver, broad thinker.' },
                          ].map((trait, i) => (
                            <div key={i} className={`${trait.bg} rounded-3xl p-6 border border-slate-100 shadow-sm`}>
                               <div className="flex justify-between items-end mb-4">
                                  <h3 className={`font-bold ${trait.color}`}>{trait.name}</h3>
                                  <span className="text-2xl font-bold">{trait.score}%</span>
                               </div>
                               <div className="h-3 bg-white rounded-full overflow-hidden mb-6 shadow-inner">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${trait.score}%` }}
                                    transition={{ delay: 0.5, duration: 1 }}
                                    className={`h-full ${trait.bar} rounded-full`}
                                  />
                               </div>
                               <p className="text-slate-500 text-sm leading-relaxed">{trait.desc}</p>
                            </div>
                          ))}
                       </div>

                       <div className="bg-teal-50 border border-teal-100 rounded-3xl p-8 mb-12 flex flex-col md:flex-row items-center">
                          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-teal-600 shadow-sm mb-6 md:mb-0 md:mr-8 flex-shrink-0">
                             <Star className="w-8 h-8 fill-teal-50" />
                          </div>
                          <div className="text-left flex-1">
                             <h3 className="text-xl font-bold mb-2">Our Recommendation</h3>
                             <p className="text-slate-600">Your profile suggests you learn best with high-engagement, visually stimulating tasks. We recommend using <strong>ADHD Mode</strong> to manage distractions during deep study.</p>
                          </div>
                       </div>
                       
                       <button 
                         onClick={() => navigate('/dashboard')}
                         className="bg-teal-600 text-white font-bold px-12 py-5 rounded-2xl hover:bg-teal-700 transition-all shadow-lg shadow-teal-100 text-lg"
                       >
                         Go to Dashboard →
                       </button>
                    </div>
                 </motion.div>
               } />
             </Routes>
           </AnimatePresence>
        </div>
      </main>

      {/* Feedback Overlay */}
      <AnimatePresence>
        {feedback && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm"
          >
             <motion.div
               initial={{ scale: 0.8, y: 20 }}
               animate={{ scale: 1, y: 0 }}
               exit={{ scale: 0.8, opacity: 0 }}
               className={`bg-white rounded-3xl p-12 shadow-2xl text-center max-w-sm w-full mx-4 ${feedback.isCorrect ? 'border-b-8 border-green-500' : 'border-b-8 border-orange-400'}`}
             >
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${feedback.isCorrect ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                   {feedback.isCorrect ? <Check className="w-10 h-10" /> : <X className="w-10 h-10" />}
                </div>
                <h3 className="text-2xl font-bold mb-2">{feedback.isCorrect ? 'Correct!' : 'Almost there!'}</h3>
                <p className="text-slate-600">{feedback.message}</p>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

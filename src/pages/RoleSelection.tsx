import { motion } from 'motion/react';
import { User, Users, Briefcase, ArrowRight, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const roles = [
  {
    id: 'student',
    title: "I'm a Student",
    description: "Start your personalized learning journey with fun games and lessons tailored to how you learn best.",
    icon: User,
    color: 'bg-teal-50',
    iconColor: 'text-teal-600',
    borderColor: 'border-teal-200',
    hoverBorder: 'hover:border-teal-400',
    buttonColor: 'text-teal-600',
  },
  {
    id: 'parent',
    title: "I'm a Parent",
    description: "Track your child's progress, view insights, and support their learning with detailed reports.",
    icon: Users,
    color: 'bg-purple-50',
    iconColor: 'text-purple-600',
    borderColor: 'border-purple-200',
    hoverBorder: 'hover:border-purple-400',
    buttonColor: 'text-purple-600',
  },
  {
    id: 'educator',
    title: "I'm an Educator",
    description: "Manage student progress, create personalized interventions, and track IEP goals.",
    icon: Briefcase,
    color: 'bg-orange-50',
    iconColor: 'text-orange-600',
    borderColor: 'border-orange-200',
    hoverBorder: 'hover:border-orange-400',
    buttonColor: 'text-orange-600',
  },
];

export default function RoleSelection() {
  const navigate = useNavigate();

  const handleSelect = (roleId: string) => {
    navigate(`/auth/register/details?role=${roleId}`);
  };

  return (
    <div className="min-h-screen gradient-bg flex flex-col p-6 sm:p-12">
      <header className="mb-12">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center max-w-6xl mx-auto w-full">
        <motion.div
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Who are you?</h1>
          <p className="text-slate-600 text-lg">Select your role to get started with LearnMate</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {roles.map((role, index) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => handleSelect(role.id)}
              className={`cursor-pointer ${role.color} border-2 ${role.borderColor} ${role.hoverBorder} rounded-3xl p-8 flex flex-col items-center text-center transition-all shadow-sm hover:shadow-md h-full`}
            >
              <div className={`w-16 h-16 rounded-full ${role.iconColor} bg-white flex items-center justify-center mb-6 shadow-inner`}>
                <role.icon className="w-8 h-8" />
              </div>
              
              <h2 className="text-2xl font-bold mb-4">{role.title}</h2>
              <p className="text-slate-600 mb-8 flex-1">{role.description}</p>
              
              <button className={`flex items-center font-bold ${role.buttonColor} hover:underline`}>
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </motion.div>
          ))}
        </div>

        <p className="mt-12 text-slate-500 text-sm">
          Not sure? You can change your role anytime in your account settings.
        </p>
      </main>

      <footer className="mt-12 text-center text-slate-400 text-xs flex items-center justify-center">
        <span className="mr-2">Made with LearnMate</span>
      </footer>
    </div>
  );
}

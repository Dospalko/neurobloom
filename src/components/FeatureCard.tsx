import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  path: string;
  color: "cyan" | "purple" | "orange";
  delay?: number;
}

const FeatureCard = ({ title, description, icon, path, color, delay = 0 }: FeatureCardProps) => {
  const navigate = useNavigate();

  const colorClasses = {
    cyan: "border-neuro-cyan/30 shadow-neuro-cyan/5",
    purple: "border-neuro-purple/30 shadow-neuro-purple/5",
    orange: "border-neuro-orange/30 shadow-neuro-orange/5",
  };

  const bgClasses = {
    cyan: "bg-neuro-cyan/10",
    purple: "bg-neuro-purple/10",
    orange: "bg-neuro-orange/10",
  };

  const textClasses = {
    cyan: "text-neuro-cyan",
    purple: "text-neuro-purple",
    orange: "text-neuro-orange",
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.001 + 0.5, duration: 0.5 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className={`group relative p-8 flex flex-col items-center text-center rounded-2xl border bg-black/40 backdrop-blur-md cursor-pointer overflow-hidden transition-all duration-300 ${colorClasses[color]}`}
      onClick={() => navigate(path)}
    >
      {/* Dynamic Background Gradient */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/5 to-transparent z-0`} />
      
      {/* Background Glow Blob */}
      <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full blur-3xl opacity-20 transition-all duration-500 group-hover:opacity-40 group-hover:scale-150 ${bgClasses[color].replace('bg-', 'bg-')} z-0`} />
      
      {/* Icon */}
      <div className={`relative mb-6 w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${bgClasses[color]} ${textClasses[color]} group-hover:scale-110 shadow-lg z-10`}>
        {icon}
      </div>

      {/* Content */}
      <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-white transition-colors relative z-10 w-full">
        {title}
      </h3>
      <p className="text-base text-gray-400 group-hover:text-gray-200 transition-colors leading-relaxed relative z-10 w-full max-w-sm mx-auto">
        {description}
      </p>

      {/* Interactive Arrow */}
      <motion.div 
        className={`absolute bottom-6 right-6 ${textClasses[color]}`}
        initial={{ opacity: 0, x: -10 }}
        whileHover={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </motion.div>
    </motion.div>
  );
};

export default FeatureCard;

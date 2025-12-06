import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

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
    cyan: "border-neuro-cyan/30 hover:border-neuro-cyan/60 hover:shadow-neuro-cyan/20",
    purple: "border-neuro-purple/30 hover:border-neuro-purple/60 hover:shadow-neuro-purple/20",
    orange: "border-neuro-orange/30 hover:border-neuro-orange/60 hover:shadow-neuro-orange/20",
  };

  const bgClasses = {
    cyan: "bg-neuro-cyan/10 group-hover:bg-neuro-cyan/20",
    purple: "bg-neuro-purple/10 group-hover:bg-neuro-purple/20",
    orange: "bg-neuro-orange/10 group-hover:bg-neuro-orange/20",
  };

  const textClasses = {
    cyan: "text-neuro-cyan",
    purple: "text-neuro-purple",
    orange: "text-neuro-orange",
  };

  return (
    <div 
      className={`group relative p-6 rounded-xl border bg-black/40 backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-lg cursor-pointer overflow-hidden ${colorClasses[color]}`}
      onClick={() => navigate(path)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Background Glow */}
      <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl opacity-20 transition-opacity duration-500 group-hover:opacity-40 ${bgClasses[color].replace('bg-', 'bg-')}`} />
      
      {/* Icon */}
      <div className={`relative mb-4 w-12 h-12 rounded-lg flex items-center justify-center transition-colors duration-300 ${bgClasses[color]} ${textClasses[color]}`}>
        {icon}
      </div>

      {/* Content */}
      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-white transition-colors">
        {title}
      </h3>
      <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors leading-relaxed">
        {description}
      </p>

      {/* Arrow */}
      <div className={`absolute bottom-6 right-6 opacity-0 transform translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ${textClasses[color]}`}>
        →
      </div>
    </div>
  );
};

export default FeatureCard;

interface InfoSectionProps {
  title: string;
  description: string;
  align?: "left" | "right";
}

const InfoSection = ({ title, description, align = "left" }: InfoSectionProps) => {
  const alignClass = align === "right" ? "md:flex-row-reverse md:text-right" : "md:flex-row md:text-left";
  
  return (
    <section className={`relative px-6 py-16 ${alignClass}`}>
      <div className="max-w-6xl mx-auto">
        <div className={`flex flex-col ${alignClass} items-center gap-12`}>
          {/* Decorative number */}
          <div className="relative">
            <div className="text-9xl font-bold gradient-text opacity-20">
              {Math.floor(Math.random() * 999) + 1}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 border-2 border-neuro-cyan/30 rounded-full animate-pulse-slow" />
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold gradient-text">
              {title}
            </h2>
            <div className={`w-24 h-1 bg-gradient-to-r from-neuro-cyan to-neuro-purple ${align === "right" ? "md:ml-auto" : ""}`} />
            <p className="text-lg text-gray-300 leading-relaxed max-w-2xl">
              {description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InfoSection;


interface InfoSectionProps {
  title: string;
  description: string;
  align?: "left" | "right";
}

const InfoSection = ({ title, description, align = "left" }: InfoSectionProps) => {
  const alignClass = align === "right" ? "md:flex-row-reverse md:text-right" : "md:flex-row md:text-left";
  
  return (
    <section className={`relative px-6 py-16 md:py-24`}>
      <div className="max-w-7xl mx-auto">
        <div className={`flex flex-col ${alignClass} items-center gap-12 md:gap-24`}>
          {/* Dekoratívny prvok */}
          <div className="relative w-32 h-32 flex items-center justify-center">
            <div className="absolute inset-0 border border-neuro-blue/20 rounded-lg rotate-45 animate-pulse-slow" />
            <div className="absolute inset-4 border border-neuro-purple/30 rounded-lg -rotate-45" />
            <div className="text-4xl font-bold text-white/10 font-mono">
              {String(Math.floor(Math.random() * 99) + 1).padStart(2, '0')}
            </div>
          </div>
          
          {/* Obsah */}
          <div className="flex-1 space-y-6">
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
              {title}
            </h2>
            <div className={`w-12 h-1 bg-neuro-blue rounded-full ${align === "right" ? "md:ml-auto" : ""}`} />
            <p className={`text-base md:text-lg text-gray-400 leading-relaxed max-w-xl font-light ${align === "right" ? "md:ml-auto" : ""}`}>
              {description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InfoSection;


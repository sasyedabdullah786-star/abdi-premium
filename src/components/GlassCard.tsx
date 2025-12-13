import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface GlassCardProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  to: string;
  delay?: number;
}

const GlassCard = ({ title, subtitle, icon: Icon, to, delay = 0 }: GlassCardProps) => {
  return (
    <Link 
      to={to}
      className="glass-card-hover p-6 flex flex-col items-center text-center gap-4 opacity-0 animate-fade-in group"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="icon-gradient group-hover:glow-effect transition-all duration-300">
        <Icon className="w-8 h-8 text-primary" />
      </div>
      <div>
        <h3 className="font-display text-xl font-bold text-foreground group-hover:gradient-text transition-all duration-300">
          {title}
        </h3>
        {subtitle && (
          <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>
        )}
      </div>
    </Link>
  );
};

export default GlassCard;

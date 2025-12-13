import { Link } from "react-router-dom";
import { LucideIcon, ExternalLink, Book, Video, FileText } from "lucide-react";

interface ResourceLink {
  title: string;
  url: string;
  icon: LucideIcon;
}

interface InstituteCardProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  description?: string;
  crashCourse?: string;
  resources?: ResourceLink[];
  connectedInstitutes?: { name: string; to: string }[];
  delay?: number;
}

const InstituteCard = ({
  title,
  subtitle,
  icon: Icon,
  description,
  crashCourse,
  resources,
  connectedInstitutes,
  delay = 0,
}: InstituteCardProps) => {
  return (
    <div 
      className="glass-card p-6 md:p-8 opacity-0 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="icon-gradient">
          <Icon className="w-10 h-10 text-primary" />
        </div>
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-bold gradient-text">
            {title}
          </h2>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      {/* Description */}
      {description && (
        <p className="text-muted-foreground mb-6 leading-relaxed">
          {description}
        </p>
      )}

      {/* Crash Course */}
      {crashCourse && (
        <div className="mb-6">
          <h3 className="font-display text-lg font-semibold text-foreground mb-3">
            Crash Course
          </h3>
          <Link 
            to={crashCourse}
            className="btn-gradient inline-flex items-center gap-2"
          >
            <Video className="w-4 h-4" />
            Access Crash Course
          </Link>
        </div>
      )}

      {/* Resources */}
      {resources && resources.length > 0 && (
        <div className="mb-6">
          <h3 className="font-display text-lg font-semibold text-foreground mb-3">
            Resources
          </h3>
          <div className="grid gap-3">
            {resources.map((resource, index) => (
              <Link
                key={index}
                to={resource.url}
                className="glass-card-hover p-4 flex items-center gap-3 group"
              >
                <div className="icon-gradient p-2">
                  <resource.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-foreground group-hover:gradient-text transition-all">
                  {resource.title}
                </span>
                <ExternalLink className="w-4 h-4 text-muted-foreground ml-auto" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Connected Institutes */}
      {connectedInstitutes && connectedInstitutes.length > 0 && (
        <div>
          <h3 className="font-display text-lg font-semibold text-foreground mb-3">
            Connected Institutes
          </h3>
          <div className="flex flex-wrap gap-2">
            {connectedInstitutes.map((institute, index) => (
              <Link
                key={index}
                to={institute.to}
                className="btn-glass text-sm"
              >
                {institute.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InstituteCard;

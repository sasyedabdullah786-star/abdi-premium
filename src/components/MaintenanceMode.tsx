import { Construction, Clock } from "lucide-react";

interface MaintenanceModeProps {
  message: string;
}

const MaintenanceMode = ({ message }: MaintenanceModeProps) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="glass-card p-12 max-w-lg text-center animate-fade-in-up">
        <div className="icon-glow w-24 h-24 mx-auto mb-8 flex items-center justify-center">
          <Construction className="w-12 h-12 text-primary" />
        </div>
        <h1 className="font-display text-3xl font-bold gradient-text mb-4">
          Under Maintenance
        </h1>
        <p className="text-muted-foreground text-lg mb-8">
          {message}
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>We'll be back soon!</span>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceMode;

import { Clock, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface ComingSoonProps {
  pageName: string;
}

const ComingSoon = ({ pageName }: ComingSoonProps) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-warning/20 flex items-center justify-center">
          <Clock className="w-10 h-10 text-warning" />
        </div>
        <h1 className="font-display text-3xl font-bold mb-4">
          <span className="gradient-text">Coming Soon</span>
        </h1>
        <p className="text-muted-foreground mb-8">
          The <span className="text-foreground font-medium">{pageName}</span> page is currently under construction. 
          We're working hard to bring you something amazing. Stay tuned!
        </p>
        <Link to="/" className="btn-gradient inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default ComingSoon;

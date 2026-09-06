import { Link } from "react-router-dom";
import { Lock, ShieldCheck, Clock, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { CoursePurchase } from "@/hooks/useCourseAccess";

interface Props {
  title: string;
  amount: number;
  currency: string;
  purchase: CoursePurchase | null;
  onBuy: () => Promise<void>;
  buying?: boolean;
}

const format = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
};

const CoursePaywall = ({ title, amount, currency, purchase, onBuy, buying }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();

  return (
    <div className="glass-card p-8 md:p-12 text-center max-w-2xl mx-auto">
      <div className="icon-glow w-16 h-16 mx-auto mb-6 flex items-center justify-center">
        <Lock className="w-8 h-8 text-primary" />
      </div>
      <h2 className="font-display text-2xl font-bold mb-2">This is a premium course</h2>
      <p className="text-muted-foreground mb-6">
        Lessons, notes and downloads for <span className="text-foreground font-medium">{title}</span> unlock after purchase.
      </p>

      <div className="text-3xl font-bold mb-6">{format(amount, currency)}</div>

      {!user ? (
        <Link to="/auth" className="btn-gradient inline-flex items-center gap-2">
          <LogIn className="w-4 h-4" /> Sign in to continue
        </Link>
      ) : purchase?.status === "pending" ? (
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/40 border border-border/40 text-sm">
          <Clock className="w-4 h-4" /> Payment pending — access opens once it is confirmed
        </div>
      ) : (
        <button
          onClick={async () => {
            await onBuy();
            toast({ title: "Purchase started", description: "Your access opens as soon as the payment is confirmed." });
          }}
          disabled={buying}
          className="btn-gradient inline-flex items-center gap-2 disabled:opacity-60"
        >
          <ShieldCheck className="w-4 h-4" /> {buying ? "Please wait..." : `Buy this course`}
        </button>
      )}

      <p className="text-xs text-muted-foreground mt-6">
        Secure checkout. Your access is tied to your account and cannot be shared.
      </p>
    </div>
  );
};

export default CoursePaywall;

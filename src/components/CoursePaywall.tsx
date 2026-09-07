import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Lock, ShieldCheck, Clock, LogIn, Sparkles, CheckCircle2, 
  Video, FileText, Bot, Award, ArrowRight, CreditCard
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { CoursePurchase } from "@/hooks/useCourseAccess";
import { PaymentModal } from "@/components/payment/PaymentModal";
import { PaymentTransaction, formatCurrency } from "@/lib/paymentConfig";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Props {
  title: string;
  amount: number;
  currency: string;
  purchase: CoursePurchase | null;
  onBuy: () => Promise<void>;
  buying?: boolean;
  courseId?: string;
  thumbnailUrl?: string | null;
  duration?: string | null;
  onPaymentSuccess?: (tx: PaymentTransaction) => void;
}

const CoursePaywall = ({ 
  title, 
  amount, 
  currency, 
  purchase, 
  onBuy, 
  buying,
  courseId = "",
  thumbnailUrl,
  duration,
  onPaymentSuccess
}: Props) => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const courseData = {
    id: courseId,
    title,
    price_amount: amount,
    currency,
    thumbnail_url: thumbnailUrl,
    duration,
  };

  const handleModalSuccess = (tx: PaymentTransaction) => {
    if (onPaymentSuccess) {
      onPaymentSuccess(tx);
    }
    // Also trigger onBuy to ensure hook refresh
    onBuy().catch(() => {});
  };

  return (
    <>
      <div className="glass-card p-8 md:p-12 max-w-3xl mx-auto rounded-2xl border border-primary/20 shadow-2xl overflow-hidden relative">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative text-center">
          <div className="icon-glow w-16 h-16 mx-auto mb-5 flex items-center justify-center bg-primary/10 rounded-2xl border border-primary/30">
            <Lock className="w-8 h-8 text-primary" />
          </div>

          <Badge variant="outline" className="mb-3 px-3 py-1 bg-primary/5 border-primary/30 text-primary text-xs font-semibold uppercase tracking-wider">
            Premium Verified Curriculum
          </Badge>

          <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
            Unlock Full Access to <span className="gradient-text">{title}</span>
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-lg mx-auto mb-8">
            Complete masterclass curriculum, high-yield practice modules, lecture notes, and downloadable formulas.
          </p>

          {/* Pricing Highlight Box */}
          <div className="p-6 rounded-2xl bg-muted/30 border border-border/50 max-w-md mx-auto mb-8">
            <div className="flex items-center justify-between gap-4 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Lifetime Access Pass</span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full">
                7-Day Money Back
              </span>
            </div>

            <div className="flex items-baseline justify-center gap-2">
              <span className="font-display text-4xl font-extrabold text-foreground">
                {formatCurrency(amount, currency)}
              </span>
              <span className="text-xs text-muted-foreground">one-time payment</span>
            </div>

            <p className="text-xs text-muted-foreground mt-2">
              Includes all upcoming updates, video lessons, and certificate.
            </p>
          </div>

          {/* Value Props Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-lg mx-auto mb-8 text-xs md:text-sm">
            <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/20 border border-border/30">
              <Video className="w-4 h-4 text-primary shrink-0" />
              <span>Full Ultra-HD Video Lectures</span>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/20 border border-border/30">
              <FileText className="w-4 h-4 text-accent shrink-0" />
              <span>Downloadable Notes & Formula Sheets</span>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/20 border border-border/30">
              <Bot className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>24/7 AI Doubt Solver & Tutor</span>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/20 border border-border/30">
              <Award className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Verified Certificate of Completion</span>
            </div>
          </div>

          {/* Action Button */}
          {!user ? (
            <Link 
              to={`/auth?redirect=/course/${courseId}`} 
              className="btn-gradient inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold rounded-xl shadow-lg hover:shadow-primary/25 transition-all"
            >
              <LogIn className="w-4 h-4" /> Sign In to Enroll & Pay
            </Link>
          ) : purchase?.status === "pending" ? (
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-sm text-amber-500 font-medium">
                <Clock className="w-4 h-4" /> Payment verification pending
              </div>
              <div>
                <Button 
                  onClick={() => setIsModalOpen(true)} 
                  variant="outline" 
                  size="sm"
                  className="text-xs"
                >
                  Pay via Online Gateway (Instant Access)
                </Button>
              </div>
            </div>
          ) : (
            <Button
              onClick={() => setIsModalOpen(true)}
              disabled={buying}
              className="btn-gradient inline-flex items-center justify-center gap-2.5 px-8 py-6 text-base font-semibold rounded-xl shadow-xl hover:shadow-primary/25 transition-all w-full max-w-md mx-auto"
            >
              <CreditCard className="w-5 h-5" />
              <span>Proceed to Checkout ({formatCurrency(amount, currency)})</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          )}

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-muted-foreground mt-6">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> 256-Bit SSL Encrypted
            </span>
            <span>•</span>
            <span>Instant Course Activation</span>
            <span>•</span>
            <span>Cards, UPI, Net Banking & Wallets</span>
          </div>
        </div>
      </div>

      {/* Interactive Payment Checkout Modal */}
      <PaymentModal
        course={courseData}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
      />
    </>
  );
};

export default CoursePaywall;

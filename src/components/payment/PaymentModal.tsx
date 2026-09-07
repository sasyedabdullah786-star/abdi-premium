import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  CreditCard, QrCode, Building2, Wallet, ShieldCheck, 
  Lock, CheckCircle2, ArrowRight, Tag, Sparkles, Clock, 
  RefreshCw, AlertCircle, Copy, Check, FileText, Award
} from 'lucide-react';
import { 
  formatCurrency, COUPONS, PaymentTransaction, 
  saveTransaction, generateInvoiceNumber, generateProviderRef,
  getPaymentSettings
} from '@/lib/paymentConfig';
import { PaymentInvoice } from './PaymentInvoice';
import { startRazorpayCheckout } from '@/lib/razorpay';


interface CourseInfo {
  id: string;
  title: string;
  price_amount: number;
  currency: string;
  thumbnail_url?: string | null;
  duration?: string | null;
}

interface PaymentModalProps {
  course: CourseInfo;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (transaction: PaymentTransaction) => void;
}

export const PaymentModal = ({ course, isOpen, onClose, onSuccess }: PaymentModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const settings = getPaymentSettings();

  // Checkout State
  const [method, setMethod] = useState<'card' | 'upi' | 'netbanking' | 'wallet'>('card');
  const [step, setStep] = useState<'checkout' | 'processing' | 'otp' | 'success'>('checkout');
  
  // Pricing & Coupon
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; percent: number } | null>(null);
  const [couponError, setCouponError] = useState('');

  // Card Inputs
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [saveCard, setSaveCard] = useState(true);

  // UPI Inputs
  const [upiId, setUpiId] = useState('');
  const [qrTimer, setQrTimer] = useState(300); // 5 minutes

  // Net Banking
  const [selectedBank, setSelectedBank] = useState('HDFC');

  // Completed Transaction
  const [completedTx, setCompletedTx] = useState<PaymentTransaction | null>(null);
  const [rzpLoading, setRzpLoading] = useState(false);

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setStep('checkout');
      setCouponCode('');
      setAppliedCoupon(null);
      setCouponError('');
      setCardNumber('');
      setCardName(user?.user_metadata?.full_name || '');
      setCardExpiry('');
      setCardCvv('');
      setUpiId('');
      setQrTimer(300);
      setCompletedTx(null);
    }
  }, [isOpen, user]);

  // QR Timer Countdown
  useEffect(() => {
    if (step !== 'checkout' || method !== 'upi' || qrTimer <= 0) return;
    const interval = setInterval(() => {
      setQrTimer(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [step, method, qrTimer]);

  // Pricing calculations
  const originalPrice = Number(course.price_amount) || 0;
  const currency = course.currency || settings.defaultCurrency || 'INR';

  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    return (originalPrice * appliedCoupon.percent) / 100;
  }, [originalPrice, appliedCoupon]);

  const priceAfterDiscount = Math.max(0, originalPrice - discountAmount);
  
  // Tax is inclusive or standard
  const taxAmount = useMemo(() => {
    if (priceAfterDiscount <= 0 || !settings.taxPercentage) return 0;
    // Calculate inclusive GST
    return Math.round((priceAfterDiscount * settings.taxPercentage) / (100 + settings.taxPercentage));
  }, [priceAfterDiscount, settings.taxPercentage]);

  const totalPayable = priceAfterDiscount;

  // Detect card brand
  const cardBrand = useMemo(() => {
    const clean = cardNumber.replace(/\s/g, '');
    if (/^4/.test(clean)) return 'Visa';
    if (/^5[1-5]/.test(clean)) return 'Mastercard';
    if (/^3[47]/.test(clean)) return 'American Express';
    if (/^(?:60|65|81|82)/.test(clean)) return 'RuPay';
    return 'Card';
  }, [cardNumber]);

  // Card Number Formatter
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 16);
    val = val.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(val);
  };

  // Expiry Formatter
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 2) {
      val = `${val.slice(0, 2)}/${val.slice(2)}`;
    }
    setCardExpiry(val);
  };

  // Quick fill test card
  const handleFillTestCard = () => {
    setCardNumber('4242 4242 4242 4242');
    setCardName(user?.user_metadata?.full_name || 'Test Learner');
    setCardExpiry('12/28');
    setCardCvv('123');
    toast({ title: 'Test card details populated', description: 'Visa •••• 4242 is ready for simulated checkout.' });
  };

  // Quick fill test UPI
  const handleFillTestUpi = () => {
    setUpiId('student@okhdfcbank');
    toast({ title: 'Test UPI ID populated', description: 'Ready for instant simulated verification.' });
  };

  // Apply Coupon
  const handleApplyCoupon = () => {
    setCouponError('');
    const clean = couponCode.trim().toUpperCase();
    if (!clean) return;

    const match = COUPONS[clean];
    if (match) {
      setAppliedCoupon({ code: clean, percent: match.discountPercent });
      toast({ 
        title: `Coupon '${clean}' applied!`, 
        description: `${match.description} (${match.discountPercent}% off)` 
      });
    } else {
      setCouponError('Invalid promo code. Try WELCOME20, STUDENT50 or ABDI100');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  // Initiate Payment Submission
  const handleRazorpayPayment = async () => {
    if (!user) {
      toast({ title: 'Please sign in', description: 'You need an account to link your course purchase.', variant: 'destructive' });
      return;
    }
    setRzpLoading(true);
    const result = await startRazorpayCheckout({
      courseId: course.id,
      couponCode: appliedCoupon?.code,
    });
    setRzpLoading(false);

    if (!result.success) {
      if (result.error === 'cancelled') return;
      toast({ title: 'Payment not completed', description: result.error, variant: 'destructive' });
      return;
    }
    processSuccessfulPayment('razorpay', result.paymentId);
  };

  const handleInitiatePayment = () => {

    if (!user) {
      toast({ title: 'Please sign in', description: 'You need an account to link your course purchase.', variant: 'destructive' });
      return;
    }

    // Free via 100% coupon
    if (totalPayable === 0) {
      processSuccessfulPayment('free');
      return;
    }

    // Validation per method
    if (method === 'card') {
      const cleanNum = cardNumber.replace(/\s/g, '');
      if (cleanNum.length < 15) {
        toast({ title: 'Invalid Card', description: 'Please enter a valid card number or click "Quick Test Card".', variant: 'destructive' });
        return;
      }
      if (!cardExpiry || cardExpiry.length < 5) {
        toast({ title: 'Invalid Expiry', description: 'Please enter MM/YY format.', variant: 'destructive' });
        return;
      }
      if (!cardCvv || cardCvv.length < 3) {
        toast({ title: 'Invalid CVV', description: 'Please enter a 3 or 4 digit security code.', variant: 'destructive' });
        return;
      }
    } else if (method === 'upi') {
      if (!upiId && qrTimer <= 0) {
        toast({ title: 'QR Code Expired', description: 'Please enter your UPI ID or refresh the timer.', variant: 'destructive' });
        return;
      }
    }

    // Move to 3DS / processing
    setStep('processing');
    setTimeout(() => {
      // If card or high amount, show 3D Secure verification step for hyper-realistic feel
      if (method === 'card') {
        setStep('otp');
      } else {
        processSuccessfulPayment(method);
      }
    }, 1200);
  };

  // Complete Payment logic
  const processSuccessfulPayment = (chosenMethod: string, externalRef?: string) => {
    setStep('processing');

    setTimeout(() => {
      const providerRef = externalRef || generateProviderRef(chosenMethod);

      const invoiceNumber = generateInvoiceNumber();

      const newTx: PaymentTransaction = {
        id: crypto.randomUUID ? crypto.randomUUID() : `tx_${Date.now()}`,
        userId: user?.id || 'guest',
        userEmail: user?.email || 'learner@abdi.edu',
        userName: user?.user_metadata?.full_name || cardName || undefined,
        courseId: course.id,
        courseTitle: course.title,
        amount: totalPayable,
        originalAmount: originalPrice,
        discountAmount,
        taxAmount,
        currency,
        status: 'paid',
        paymentMethod: chosenMethod as any,
        providerRef,
        couponCode: appliedCoupon?.code,
        cardLast4: chosenMethod === 'card' ? cardNumber.replace(/\s/g, '').slice(-4) || '4242' : undefined,
        cardBrand: chosenMethod === 'card' ? cardBrand : undefined,
        upiId: chosenMethod === 'upi' ? (upiId || settings.upiId) : undefined,
        bankName: chosenMethod === 'netbanking' ? selectedBank : undefined,
        createdAt: new Date().toISOString(),
        invoiceNumber,
      };

      // Save locally
      saveTransaction(newTx);
      setCompletedTx(newTx);
      setStep('success');

      // Trigger success callback to unlock course
      onSuccess(newTx);

      toast({
        title: 'Payment Successful! 🎉',
        description: `Lifetime access to "${course.title}" is now unlocked!`,
      });
    }, 1200);
  };

  const minutesLeft = Math.floor(qrTimer / 60);
  const secondsLeft = qrTimer % 60;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={open => !open && (step === 'processing' ? null : onClose())}>
        <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto p-0 border border-border/60 bg-card text-card-foreground shadow-2xl">
          {/* Header */}
          <DialogHeader className="p-6 pb-4 border-b border-border/40 bg-muted/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <DialogTitle className="font-display text-lg font-bold">Secure Course Checkout</DialogTitle>
                  <DialogDescription className="text-xs">
                    256-bit SSL encrypted • Instant lifetime activation
                  </DialogDescription>
                </div>
              </div>
              <Badge variant="outline" className="text-xs bg-background/50 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> PCI-DSS Compliant
              </Badge>
            </div>
          </DialogHeader>

          {/* STEP 1: CHECKOUT VIEW */}
          {step === 'checkout' && (
            <div className="p-6 space-y-6">
              {/* Course Mini Card */}
              <div className="flex items-center gap-4 p-3.5 rounded-xl bg-muted/30 border border-border/40">
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-primary/20 shrink-0 border border-border/50">
                  {course.thumbnail_url ? (
                    <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary font-bold text-lg">
                      {course.title.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-display font-semibold text-sm truncate">{course.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-primary" /> {course.duration || 'Full Curriculum'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="w-3 h-3 text-accent" /> Certificate Included
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-base text-foreground">
                    {formatCurrency(originalPrice, currency)}
                  </div>
                  <span className="text-[10px] text-muted-foreground">One-time payment</span>
                </div>
              </div>

              {/* Coupon Code Section */}
              <div className="space-y-1.5">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Enter promo code (e.g. STUDENT50, ABDI100)"
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value.toUpperCase())}
                      onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                      className="pl-9 font-mono text-sm uppercase h-9"
                      disabled={!!appliedCoupon}
                    />
                  </div>
                  {appliedCoupon ? (
                    <Button variant="outline" size="sm" onClick={handleRemoveCoupon} className="text-destructive h-9">
                      Remove
                    </Button>
                  ) : (
                    <Button variant="secondary" size="sm" onClick={handleApplyCoupon} className="gap-1.5 h-9">
                      <Sparkles className="w-3.5 h-3.5 text-primary" /> Apply
                    </Button>
                  )}
                </div>
                {appliedCoupon && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Coupon <strong>{appliedCoupon.code}</strong> applied: {appliedCoupon.percent}% off!
                  </p>
                )}
                {couponError && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {couponError}
                  </p>
                )}
              </div>

              {/* Payment Methods Selection */}
              <div className="space-y-3">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Select Payment Method
                </Label>

                <Tabs value={method} onValueChange={(val: any) => setMethod(val)} className="w-full">
                  <TabsList className="grid grid-cols-4 w-full h-10 p-1 bg-muted/40">
                    <TabsTrigger value="card" className="text-xs gap-1.5 data-[state=active]:bg-card">
                      <CreditCard className="w-3.5 h-3.5" /> Card
                    </TabsTrigger>
                    <TabsTrigger value="upi" className="text-xs gap-1.5 data-[state=active]:bg-card">
                      <QrCode className="w-3.5 h-3.5" /> UPI / QR
                    </TabsTrigger>
                    <TabsTrigger value="netbanking" className="text-xs gap-1.5 data-[state=active]:bg-card">
                      <Building2 className="w-3.5 h-3.5" /> Net Banking
                    </TabsTrigger>
                    <TabsTrigger value="wallet" className="text-xs gap-1.5 data-[state=active]:bg-card">
                      <Wallet className="w-3.5 h-3.5" /> Wallets
                    </TabsTrigger>
                  </TabsList>

                  {/* TAB 1: CARD */}
                  <TabsContent value="card" className="space-y-3.5 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Supports Visa, Mastercard, RuPay & Amex</span>
                      <Button variant="ghost" size="sm" onClick={handleFillTestCard} className="h-7 text-xs text-primary gap-1 px-2">
                        <Sparkles className="w-3 h-3" /> Quick Test Card
                      </Button>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Card Number</Label>
                      <div className="relative">
                        <Input
                          placeholder="4242 •••• •••• 4242"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          maxLength={19}
                          className="font-mono text-sm pr-16"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-primary">
                          {cardBrand}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Expiry Date</Label>
                        <Input
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={handleExpiryChange}
                          maxLength={5}
                          className="font-mono text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">CVV / CVC</Label>
                        <Input
                          type="password"
                          placeholder="•••"
                          value={cardCvv}
                          onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          maxLength={4}
                          className="font-mono text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Name on Card</Label>
                      <Input
                        placeholder="Learner Full Name"
                        value={cardName}
                        onChange={e => setCardName(e.target.value)}
                        className="text-sm"
                      />
                    </div>

                    <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer pt-1">
                      <input 
                        type="checkbox" 
                        checked={saveCard} 
                        onChange={e => setSaveCard(e.target.checked)} 
                        className="rounded border-border"
                      />
                      <span>Save card details securely for future 1-click enrollments</span>
                    </label>
                  </TabsContent>

                  {/* TAB 2: UPI / QR CODE */}
                  <TabsContent value="upi" className="space-y-4 pt-3">
                    <div className="p-4 rounded-xl bg-muted/20 border border-border/40 text-center space-y-3">
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>Scan with any UPI App (GPay, PhonePe, Paytm)</span>
                        <span className="font-mono text-primary font-medium">
                          Expires in {minutesLeft}:{secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft}
                        </span>
                      </div>

                      {/* Simulated QR Visual */}
                      <div className="w-44 h-44 mx-auto p-2 bg-white rounded-xl shadow-md border border-border/30 flex flex-col items-center justify-center relative">
                        <div className="w-full h-full bg-slate-950 p-2 rounded-lg flex items-center justify-center">
                          <QrCode className="w-36 h-36 text-white" />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center text-primary font-bold text-xs">
                            ₹
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                        <span className="font-mono bg-muted/60 px-2 py-1 rounded select-all">
                          {settings.upiId}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2"
                          onClick={() => {
                            navigator.clipboard.writeText(settings.upiId);
                            setCopiedUpi(true);
                            setTimeout(() => setCopiedUpi(false), 2000);
                          }}
                        >
                          {copiedUpi ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        </Button>
                      </div>
                    </div>

                    {/* Or enter UPI ID */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <Label className="text-xs">Or Enter Your UPI ID</Label>
                        <Button variant="ghost" size="sm" onClick={handleFillTestUpi} className="h-6 text-xs text-primary gap-1 px-1.5">
                          <Sparkles className="w-3 h-3" /> Test UPI ID
                        </Button>
                      </div>
                      <Input
                        placeholder="yourname@okhdfcbank"
                        value={upiId}
                        onChange={e => setUpiId(e.target.value)}
                        className="text-sm font-mono"
                      />
                    </div>
                  </TabsContent>

                  {/* TAB 3: NET BANKING */}
                  <TabsContent value="netbanking" className="space-y-3 pt-3">
                    <Label className="text-xs text-muted-foreground">Select Popular Bank</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra', 'Punjab National Bank'].map(bank => (
                        <button
                          key={bank}
                          type="button"
                          onClick={() => setSelectedBank(bank)}
                          className={`p-2.5 rounded-lg text-xs font-medium border text-left transition-all ${
                            selectedBank === bank
                              ? 'bg-primary/10 border-primary text-primary font-semibold'
                              : 'bg-muted/20 border-border/40 hover:bg-muted/40 text-muted-foreground'
                          }`}
                        >
                          {bank}
                        </button>
                      ))}
                    </div>
                  </TabsContent>

                  {/* TAB 4: WALLETS */}
                  <TabsContent value="wallet" className="space-y-3 pt-3">
                    <Label className="text-xs text-muted-foreground">Digital Wallets & Pay Services</Label>
                    <div className="grid grid-cols-2 gap-2.5">
                      {['PayPal Express', 'Amazon Pay', 'Paytm Wallet', 'PhonePe Wallet'].map(wallet => (
                        <div
                          key={wallet}
                          className="p-3 rounded-xl border border-border/40 bg-muted/20 hover:bg-muted/40 transition-all flex items-center justify-between cursor-pointer"
                        >
                          <span className="text-xs font-medium">{wallet}</span>
                          <span className="text-[10px] text-emerald-500 font-semibold">Active</span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Order Total Breakdown */}
              <div className="p-4 rounded-xl bg-muted/30 border border-border/40 space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground text-xs">
                  <span>Course Price</span>
                  <span>{formatCurrency(originalPrice, currency)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                    <span>Discount ({appliedCoupon?.code})</span>
                    <span>-{formatCurrency(discountAmount, currency)}</span>
                  </div>
                )}

                {taxAmount > 0 && (
                  <div className="flex justify-between text-muted-foreground text-xs">
                    <span>GST (18% Included)</span>
                    <span>{formatCurrency(taxAmount, currency)}</span>
                  </div>
                )}

                <div className="border-t border-border/40 pt-2 flex justify-between items-center font-bold">
                  <span className="text-foreground">Total Payable</span>
                  <div className="text-right">
                    <span className="font-display text-xl text-primary font-extrabold">
                      {formatCurrency(totalPayable, currency)}
                    </span>
                    {discountAmount > 0 && (
                      <span className="block text-[10px] text-muted-foreground line-through">
                        {formatCurrency(originalPrice, currency)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Pay Action Buttons */}
              <Button
                onClick={handleRazorpayPayment}
                disabled={rzpLoading || totalPayable === 0}
                className="w-full h-12 text-base font-semibold btn-gradient gap-2 shadow-lg hover:shadow-primary/20 transition-all"
              >
                <Lock className="w-4 h-4" />
                {rzpLoading
                  ? 'Opening secure checkout…'
                  : `Pay ${formatCurrency(totalPayable, currency)} securely`}
              </Button>

              <Button
                variant="outline"
                onClick={handleInitiatePayment}
                className="w-full h-10 text-sm gap-2"
              >
                {totalPayable === 0 ? 'Claim Free Enrollment' : 'Use demo checkout (test mode)'}
              </Button>


              <div className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground pt-1">
                <span>✓ 7-Day Money-Back Guarantee</span>
                <span>•</span>
                <span>✓ Instant Unlocking</span>
                <span>•</span>
                <span>✓ Verified Certificate</span>
              </div>
            </div>
          )}

          {/* STEP 2: PROCESSING ANIMATION */}
          {step === 'processing' && (
            <div className="p-12 text-center space-y-6 animate-fade-in">
              <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-primary relative">
                <RefreshCw className="w-10 h-10 animate-spin" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display text-xl font-bold">Securing Your Transaction...</h3>
                <p className="text-sm text-muted-foreground">
                  Contacting payment gateway & bank network. Please do not close or refresh this window.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs bg-muted/40 border border-border/40 text-muted-foreground">
                <Lock className="w-3.5 h-3.5 text-emerald-500" /> 256-Bit SSL Handshake Active
              </div>
            </div>
          )}

          {/* STEP 2.5: 3D SECURE OTP SIMULATION (FOR CARDS) */}
          {step === 'otp' && (
            <div className="p-8 space-y-6 max-w-md mx-auto text-center animate-fade-in">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold">Bank 3D Secure Authorization</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  A verification code was requested for transaction of {formatCurrency(totalPayable, currency)} on {cardBrand} •••• {cardNumber.replace(/\s/g, '').slice(-4) || '4242'}.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-muted/30 border border-border/40 space-y-3 text-left">
                <Label className="text-xs">One-Time Password (OTP)</Label>
                <Input
                  defaultValue="883921"
                  readOnly
                  className="font-mono text-center text-lg tracking-widest bg-background"
                />
                <p className="text-[11px] text-muted-foreground text-center">
                  Sandbox simulation: Default test OTP is auto-approved.
                </p>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={() => processSuccessfulPayment('card')}
                  className="w-full btn-gradient gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> Authorize & Complete Payment
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep('checkout')}
                  className="text-xs text-muted-foreground"
                >
                  Cancel and return to checkout
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS CONFIRMATION */}
          {step === 'success' && completedTx && (
            <div className="p-8 text-center space-y-6 animate-fade-in">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/15 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-500">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="font-display text-2xl font-bold">Payment Confirmed!</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Congratulations! You now have permanent access to <strong>{course.title}</strong>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-muted/20 border border-border/40 text-left max-w-md mx-auto space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction ID:</span>
                  <span className="font-mono font-medium">{completedTx.providerRef}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Invoice Number:</span>
                  <span className="font-mono font-medium">{completedTx.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount Paid:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(completedTx.amount, completedTx.currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method:</span>
                  <span className="capitalize">{completedTx.paymentMethod}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowInvoiceModal(true)}
                  className="gap-2"
                >
                  <FileText className="w-4 h-4 text-primary" /> View Official Invoice
                </Button>
                <Button
                  onClick={onClose}
                  className="btn-gradient gap-2"
                >
                  <span>Start Learning Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Official Printable Invoice Modal */}
      <PaymentInvoice
        transaction={completedTx}
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
      />
    </>
  );
};

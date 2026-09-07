import { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Printer, Download, CheckCircle2, Building2, ShieldCheck, Mail, Calendar, Hash, CreditCard } from 'lucide-react';
import { PaymentTransaction, formatCurrency } from '@/lib/paymentConfig';
import { useToast } from '@/hooks/use-toast';

interface PaymentInvoiceProps {
  transaction: PaymentTransaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentInvoice = ({ transaction, isOpen, onClose }: PaymentInvoiceProps) => {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  if (!transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyInvoiceNumber = () => {
    navigator.clipboard.writeText(transaction.invoiceNumber);
    toast({ title: 'Copied to clipboard', description: `Invoice #${transaction.invoiceNumber}` });
  };

  const formattedDate = new Date(transaction.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 border border-border/60 bg-card text-card-foreground">
        <DialogHeader className="p-6 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <DialogTitle className="font-display text-xl">Official Payment Tax Invoice</DialogTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 h-8">
              <Printer className="w-3.5 h-3.5" /> Print / PDF
            </Button>
          </div>
        </DialogHeader>

        {/* Printable Area */}
        <div ref={invoiceRef} className="p-6 md:p-8 space-y-6 text-sm">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-border/40">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold font-display text-base">
                  A
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg leading-tight">ABD"I Academy</h3>
                  <p className="text-xs text-muted-foreground">Premier Digital Learning & Coaching</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">support@abdi.edu • GSTIN: 29AAAAA0000A1Z5</p>
            </div>

            <div className="sm:text-right">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {transaction.status.toUpperCase()}
              </div>
              <p className="text-xs font-mono font-medium text-foreground mt-1.5 cursor-pointer hover:underline flex items-center gap-1 sm:justify-end" onClick={handleCopyInvoiceNumber} title="Click to copy">
                <Hash className="w-3 h-3 text-muted-foreground" />
                {transaction.invoiceNumber}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{formattedDate}</p>
            </div>
          </div>

          {/* Student & Payment Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-muted/20 border border-border/40">
            <div>
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Billed To</span>
              <p className="font-medium text-foreground mt-0.5">{transaction.userName || transaction.userEmail.split('@')[0]}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Mail className="w-3 h-3" /> {transaction.userEmail}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Student ID: {transaction.userId.slice(0, 10)}</p>
            </div>

            <div className="sm:text-right">
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Payment Details</span>
              <p className="font-medium text-foreground mt-0.5 flex items-center gap-1.5 sm:justify-end">
                <CreditCard className="w-3.5 h-3.5 text-primary" />
                {transaction.paymentMethod === 'card' && transaction.cardLast4
                  ? `${transaction.cardBrand || 'Card'} •••• ${transaction.cardLast4}`
                  : transaction.paymentMethod === 'upi'
                  ? `UPI (${transaction.upiId || 'Instant UPI'})`
                  : transaction.paymentMethod === 'netbanking'
                  ? `Net Banking (${transaction.bankName || 'Bank'})`
                  : transaction.paymentMethod.toUpperCase()}
              </p>
              <p className="text-xs font-mono text-muted-foreground mt-0.5">
                Ref: {transaction.providerRef}
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">
                Lifetime Access Granted
              </p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="rounded-xl border border-border/40 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground border-b border-border/40">
                <tr>
                  <th className="p-3.5">Course Description</th>
                  <th className="p-3.5 text-center">Type</th>
                  <th className="p-3.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                <tr>
                  <td className="p-3.5">
                    <p className="font-semibold text-foreground">{transaction.courseTitle}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Full curriculum access, lecture video streams, lecture notes, formula sheets, problem banks & verified digital certificate.
                    </p>
                  </td>
                  <td className="p-3.5 text-center">
                    <Badge variant="outline" className="text-[10px]">Lifetime</Badge>
                  </td>
                  <td className="p-3.5 text-right font-medium">
                    {formatCurrency(transaction.originalAmount, transaction.currency)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Price Calculation Summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pt-2">
            <div className="text-xs text-muted-foreground max-w-xs space-y-1">
              <p className="font-medium text-foreground">Terms & Conditions:</p>
              <p>• Course purchases include 100% money-back guarantee within 7 days of enrollment.</p>
              <p>• Access is strictly single-user and authenticated to this email address.</p>
            </div>

            <div className="w-full sm:w-64 space-y-2 text-sm bg-muted/20 p-4 rounded-xl border border-border/40">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatCurrency(transaction.originalAmount, transaction.currency)}</span>
              </div>
              {transaction.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Discount {transaction.couponCode ? `(${transaction.couponCode})` : ''}</span>
                  <span>-{formatCurrency(transaction.discountAmount, transaction.currency)}</span>
                </div>
              )}
              {transaction.taxAmount > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>GST (Included)</span>
                  <span>{formatCurrency(transaction.taxAmount, transaction.currency)}</span>
                </div>
              )}
              <div className="border-t border-border/50 pt-2 flex justify-between font-bold text-base text-foreground">
                <span>Total Paid</span>
                <span className="text-primary">{formatCurrency(transaction.amount, transaction.currency)}</span>
              </div>
            </div>
          </div>

          {/* Official Verification Seal */}
          <div className="pt-4 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground text-center sm:text-left">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Computer-generated official receipt. No physical signature required.</span>
            </div>
            <span className="font-mono text-[11px] bg-muted/50 px-2 py-0.5 rounded">
              AUTH_HASH_{transaction.providerRef.slice(-8)}
            </span>
          </div>
        </div>

        <div className="p-4 bg-muted/30 border-t border-border/40 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={handlePrint} className="gap-2 btn-gradient">
            <Download className="w-4 h-4" /> Download / Print Invoice
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

import { useEffect, useState, useMemo } from "react";
import { 
  CheckCircle, XCircle, RefreshCw, IndianRupee, ShieldCheck, 
  CreditCard, Search, Filter, FileText, ArrowUpRight, TrendingUp, 
  Clock, DollarSign, Settings2, Sliders, Check, RotateCcw, AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  listTransactions, updateTransactionStatus, PaymentTransaction, 
  getPaymentSettings, savePaymentSettings, PaymentGatewaySettings, 
  formatCurrency, PAYMENT_EVENT 
} from "@/lib/paymentConfig";
import { PaymentInvoice } from "@/components/payment/PaymentInvoice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

interface UnifiedOrder {
  id: string;
  userId: string;
  userEmail: string;
  courseId: string;
  courseTitle: string;
  amount: number;
  originalAmount?: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  provider: string;
  providerRef: string;
  invoiceNumber: string;
  createdAt: string;
  rawTx?: PaymentTransaction;
}

const PurchasesTab = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'orders' | 'gateways'>('orders');
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<UnifiedOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'failed'>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<PaymentTransaction | null>(null);

  // Gateway Settings State
  const [settings, setSettings] = useState<PaymentGatewaySettings>(getPaymentSettings());
  const [settingsDirty, setSettingsDirty] = useState(false);

  const load = async () => {
    setLoading(true);

    try {
      const [{ data: purchases }, { data: courseRows }, { data: profiles }] = await Promise.all([
        supabase.from("course_purchases").select("*").order("created_at", { ascending: false }),
        supabase.from("courses").select("id,title"),
        supabase.from("profiles").select("id,email,full_name"),
      ]);

      const courseMap = Object.fromEntries((courseRows || []).map((c: any) => [c.id, c.title]));
      const emailMap = Object.fromEntries((profiles || []).map((p: any) => [p.id, p.email || p.full_name || p.id]));

      // Get local transactions
      const localTxs = listTransactions();

      // Convert supabase purchases
      const supabaseOrders: UnifiedOrder[] = ((purchases as any[]) || []).map(p => ({
        id: p.id,
        userId: p.user_id,
        userEmail: emailMap[p.user_id] || p.user_id.slice(0, 10),
        courseId: p.course_id,
        courseTitle: courseMap[p.course_id] || 'Course #' + p.course_id.slice(0, 6),
        amount: Number(p.amount) || 0,
        currency: p.currency || 'INR',
        status: p.status as any,
        provider: p.provider || 'card',
        providerRef: p.provider_ref || `REF_${p.id.slice(0, 8)}`,
        invoiceNumber: `INV-2026-${p.id.replace(/\D/g, '').slice(0, 6) || '849201'}`,
        createdAt: p.created_at || new Date().toISOString(),
      }));

      // Convert local transactions
      const localOrders: UnifiedOrder[] = localTxs.map(t => ({
        id: t.id,
        userId: t.userId,
        userEmail: t.userEmail,
        courseId: t.courseId,
        courseTitle: t.courseTitle,
        amount: t.amount,
        originalAmount: t.originalAmount,
        currency: t.currency,
        status: t.status,
        provider: t.paymentMethod,
        providerRef: t.providerRef,
        invoiceNumber: t.invoiceNumber,
        createdAt: t.createdAt,
        rawTx: t,
      }));

      // Merge and deduplicate by ID or (userId + courseId)
      const seen = new Set<string>();
      const combined: UnifiedOrder[] = [];

      for (const o of [...localOrders, ...supabaseOrders]) {
        const key = o.id || `${o.userId}_${o.courseId}`;
        if (!seen.has(key)) {
          seen.add(key);
          combined.push(o);
        }
      }

      combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(combined);
    } catch (err) {
      console.warn('Error loading purchases:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const handleSync = () => load();
    window.addEventListener(PAYMENT_EVENT, handleSync);
    return () => window.removeEventListener(PAYMENT_EVENT, handleSync);
  }, []);

  // Update Status
  const handleUpdateStatus = async (order: UnifiedOrder, newStatus: 'paid' | 'failed' | 'refunded') => {
    // 1. Update local storage transaction if it exists
    updateTransactionStatus(order.id, newStatus);

    // 2. Update Supabase
    try {
      await supabase.from("course_purchases").update({ status: newStatus }).eq("id", order.id);
    } catch (err) {
      console.warn("Supabase purchase status update error:", err);
    }

    setOrders(prev => prev.map(o => (o.id === order.id ? { ...o, status: newStatus } : o)));

    toast({
      title: newStatus === 'paid' ? "Purchase Confirmed" : `Status updated to ${newStatus}`,
      description: `Course access for ${order.userEmail} has been updated.`,
    });
  };

  // Save Settings
  const handleSaveSettings = () => {
    savePaymentSettings(settings);
    setSettingsDirty(false);
    toast({
      title: "Gateway Settings Saved",
      description: "Payment methods, keys, and currency configuration updated successfully.",
    });
  };

  // KPIs
  const metrics = useMemo(() => {
    const paidOrders = orders.filter(o => o.status === 'paid');
    const totalRev = paidOrders.reduce((sum, o) => sum + o.amount, 0);
    const pendingCount = orders.filter(o => o.status === 'pending').length;
    const aov = paidOrders.length > 0 ? Math.round(totalRev / paidOrders.length) : 0;
    const defaultCurr = orders[0]?.currency || settings.defaultCurrency;

    return {
      totalRevenue: totalRev,
      paidCount: paidOrders.length,
      pendingCount,
      aov,
      currency: defaultCurr,
    };
  }, [orders, settings.defaultCurrency]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = 
        !searchQuery ||
        o.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.providerRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-bold">
            <span className="gradient-text">Payment & Sales Management</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage course transactions, audit invoices, and configure live/sandbox payment gateways.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={load} className="gap-1.5 text-xs h-9">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
          </Button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Gross Revenue</span>
            <DollarSign className="w-4 h-4 text-primary" />
          </div>
          <div className="font-display text-2xl font-bold text-foreground">
            {formatCurrency(metrics.totalRevenue, metrics.currency)}
          </div>
          <p className="text-[11px] text-emerald-500 font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Live Realized Sales
          </p>
        </div>

        <div className="glass-card p-5 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Completed Orders</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="font-display text-2xl font-bold text-foreground">
            {metrics.paidCount}
          </div>
          <p className="text-[11px] text-muted-foreground">Instant digital fulfillments</p>
        </div>

        <div className="glass-card p-5 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Pending Verifications</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="font-display text-2xl font-bold text-foreground">
            {metrics.pendingCount}
          </div>
          <p className="text-[11px] text-muted-foreground">Awaiting manual or bank clearance</p>
        </div>

        <div className="glass-card p-5 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Average Order Value</span>
            <ArrowUpRight className="w-4 h-4 text-accent" />
          </div>
          <div className="font-display text-2xl font-bold text-foreground">
            {formatCurrency(metrics.aov, metrics.currency)}
          </div>
          <p className="text-[11px] text-muted-foreground">Per paying student</p>
        </div>
      </div>

      {/* Main Tabs: Orders vs Gateway Config */}
      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
        <TabsList className="glass-card p-1">
          <TabsTrigger value="orders" className="gap-2 text-xs">
            <CreditCard className="w-3.5 h-3.5" /> Course Orders & Invoices ({orders.length})
          </TabsTrigger>
          <TabsTrigger value="gateways" className="gap-2 text-xs">
            <Settings2 className="w-3.5 h-3.5" /> Gateway Settings & API Keys
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: ORDERS LIST */}
        <TabsContent value="orders" className="space-y-4 pt-4">
          {/* Search & Filter bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by student, course, or reference..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 text-xs h-9"
              />
            </div>

            <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto w-full sm:w-auto">
              {(['all', 'paid', 'pending', 'failed'] as const).map(status => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                  className="text-xs capitalize h-8"
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>

          {/* Orders Table */}
          <div className="glass-card overflow-hidden border border-border/40">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                Loading transactions...
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground space-y-2">
                <AlertCircle className="w-8 h-8 mx-auto text-muted-foreground/60" />
                <p className="font-semibold text-foreground">No orders matching your criteria</p>
                <p className="text-xs">Purchases will appear here automatically when students checkout.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/40 uppercase tracking-wider text-muted-foreground border-b border-border/40 font-semibold">
                    <tr>
                      <th className="p-3.5">Student / Buyer</th>
                      <th className="p-3.5">Course</th>
                      <th className="p-3.5">Amount</th>
                      <th className="p-3.5">Method & Ref</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Date</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {filteredOrders.map(order => (
                      <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                        <td className="p-3.5">
                          <div className="font-medium text-foreground">{order.userEmail}</div>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {order.userId.slice(0, 8)}...
                          </span>
                        </td>
                        <td className="p-3.5">
                          <div className="font-semibold text-foreground max-w-[180px] truncate" title={order.courseTitle}>
                            {order.courseTitle}
                          </div>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            #{order.invoiceNumber}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold text-foreground whitespace-nowrap">
                          {formatCurrency(order.amount, order.currency)}
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <Badge variant="outline" className="capitalize text-[10px] bg-muted/40 font-medium">
                            {order.provider}
                          </Badge>
                          <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                            {order.providerRef}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                              order.status === 'paid'
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                : order.status === 'pending'
                                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                                : 'bg-destructive/15 text-destructive border-destructive/30'
                            }`}
                          >
                            {order.status === 'paid' && <CheckCircle className="w-3 h-3" />}
                            {order.status === 'pending' && <Clock className="w-3 h-3" />}
                            {order.status === 'failed' && <XCircle className="w-3 h-3" />}
                            {order.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3.5 text-muted-foreground whitespace-nowrap text-[11px]">
                          {new Date(order.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="p-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Open Invoice */}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              title="View Tax Invoice"
                              onClick={() => {
                                const fullTx: PaymentTransaction = order.rawTx || {
                                  id: order.id,
                                  userId: order.userId,
                                  userEmail: order.userEmail,
                                  courseId: order.courseId,
                                  courseTitle: order.courseTitle,
                                  amount: order.amount,
                                  originalAmount: order.originalAmount || order.amount,
                                  discountAmount: 0,
                                  taxAmount: Math.round((order.amount * 18) / 118),
                                  currency: order.currency,
                                  status: order.status,
                                  paymentMethod: order.provider as any,
                                  providerRef: order.providerRef,
                                  createdAt: order.createdAt,
                                  invoiceNumber: order.invoiceNumber,
                                };
                                setSelectedInvoice(fullTx);
                              }}
                            >
                              <FileText className="w-4 h-4 text-primary" />
                            </Button>

                            {/* Approve */}
                            {order.status !== 'paid' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10"
                                title="Approve & Grant Access"
                                onClick={() => handleUpdateStatus(order, 'paid')}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            )}

                            {/* Reject / Refund */}
                            {order.status === 'paid' ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                                title="Mark as Refunded"
                                onClick={() => handleUpdateStatus(order, 'refunded')}
                              >
                                <RotateCcw className="w-4 h-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                                title="Reject Purchase"
                                onClick={() => handleUpdateStatus(order, 'failed')}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* TAB 2: GATEWAY CONFIGURATION */}
        <TabsContent value="gateways" className="space-y-6 pt-4">
          <div className="glass-card p-6 md:p-8 space-y-6">
            <div>
              <h3 className="font-display text-lg font-bold">Payment Gateway Settings</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Configure payment gateways for instant automated student enrollments. When unset or in test mode, the interactive sandbox checkout simulator allows frictionless testing.
              </p>
            </div>

            {/* General Gateway Parameters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-muted/20 border border-border/40">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Store Currency</Label>
                <select
                  value={settings.defaultCurrency}
                  onChange={e => {
                    setSettings({ ...settings, defaultCurrency: e.target.value as any });
                    setSettingsDirty(true);
                  }}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs font-medium"
                >
                  <option value="INR">INR (₹ Indian Rupee)</option>
                  <option value="USD">USD ($ US Dollar)</option>
                  <option value="EUR">EUR (€ Euro)</option>
                  <option value="GBP">GBP (£ British Pound)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Tax / GST Percentage (%)</Label>
                <Input
                  type="number"
                  value={settings.taxPercentage}
                  onChange={e => {
                    setSettings({ ...settings, taxPercentage: Number(e.target.value) || 0 });
                    setSettingsDirty(true);
                  }}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Business / Merchant Name</Label>
                <Input
                  value={settings.businessName}
                  onChange={e => {
                    setSettings({ ...settings, businessName: e.target.value });
                    setSettingsDirty(true);
                  }}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* Toggle Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border/40">
                <div className="space-y-0.5">
                  <Label className="text-xs font-semibold">Automated Course Unlocking</Label>
                  <p className="text-[11px] text-muted-foreground">
                    Instantly grant course access when payment is confirmed online
                  </p>
                </div>
                <Switch
                  checked={settings.autoApprove}
                  onCheckedChange={checked => {
                    setSettings({ ...settings, autoApprove: checked });
                    setSettingsDirty(true);
                  }}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border/40">
                <div className="space-y-0.5">
                  <Label className="text-xs font-semibold">Interactive Sandbox Simulator</Label>
                  <p className="text-[11px] text-muted-foreground">
                    Allow one-click test cards (4242...) and test UPI without live charges
                  </p>
                </div>
                <Switch
                  checked={settings.testMode}
                  onCheckedChange={checked => {
                    setSettings({ ...settings, testMode: checked });
                    setSettingsDirty(true);
                  }}
                />
              </div>
            </div>

            {/* Gateway Providers */}
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Payment Gateways & Keys
              </h4>

              {/* Stripe */}
              <div className="p-4 rounded-xl border border-border/40 bg-muted/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold text-xs">
                      S
                    </div>
                    <div>
                      <h5 className="font-semibold text-xs">Stripe Global Payments</h5>
                      <p className="text-[11px] text-muted-foreground">Credit/Debit Cards, Apple Pay, Google Pay</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.stripeEnabled}
                    onCheckedChange={checked => {
                      setSettings({ ...settings, stripeEnabled: checked });
                      setSettingsDirty(true);
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-muted-foreground">Stripe Publishable Key (pk_test_... or pk_live_...)</Label>
                  <Input
                    placeholder="pk_test_51..."
                    value={settings.stripePublishableKey}
                    onChange={e => {
                      setSettings({ ...settings, stripePublishableKey: e.target.value });
                      setSettingsDirty(true);
                    }}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Razorpay */}
              <div className="p-4 rounded-xl border border-border/40 bg-muted/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-xs">
                      R
                    </div>
                    <div>
                      <h5 className="font-semibold text-xs">Razorpay India Gateway</h5>
                      <p className="text-[11px] text-muted-foreground">UPI, Cards, Netbanking & Wallets</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.razorpayEnabled}
                    onCheckedChange={checked => {
                      setSettings({ ...settings, razorpayEnabled: checked });
                      setSettingsDirty(true);
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-muted-foreground">Razorpay Key ID (rzp_test_... or rzp_live_...)</Label>
                  <Input
                    placeholder="rzp_test_..."
                    value={settings.razorpayKeyId}
                    onChange={e => {
                      setSettings({ ...settings, razorpayKeyId: e.target.value });
                      setSettingsDirty(true);
                    }}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>

              {/* UPI & QR */}
              <div className="p-4 rounded-xl border border-border/40 bg-muted/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-xs">
                      ₹
                    </div>
                    <div>
                      <h5 className="font-semibold text-xs">Direct UPI & Dynamic QR Code</h5>
                      <p className="text-[11px] text-muted-foreground">GPay, PhonePe, Paytm, BHIM</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.upiEnabled}
                    onCheckedChange={checked => {
                      setSettings({ ...settings, upiEnabled: checked });
                      setSettingsDirty(true);
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-muted-foreground">Business UPI ID</Label>
                  <Input
                    placeholder="abdi.academy@okhdfcbank"
                    value={settings.upiId}
                    onChange={e => {
                      setSettings({ ...settings, upiId: e.target.value });
                      setSettingsDirty(true);
                    }}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Save Settings Button */}
            <div className="flex justify-end pt-4 border-t border-border/40">
              <Button
                onClick={handleSaveSettings}
                className="btn-gradient gap-2 text-xs font-semibold h-10 px-6"
              >
                <Check className="w-4 h-4" /> Save Gateway Configuration
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Official Tax Invoice Viewer Dialog */}
      <PaymentInvoice
        transaction={selectedInvoice}
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
      />
    </div>
  );
};

export default PurchasesTab;

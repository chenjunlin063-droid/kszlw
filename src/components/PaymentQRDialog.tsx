 import { useState, useEffect } from 'react';
 import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
 import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
 import { Button } from '@/components/ui/button';
 import { supabase } from '@/integrations/supabase/client';
 import { Loader2, MessageCircle, Phone, QrCode, CheckCircle2 } from 'lucide-react';
 import { cn } from '@/lib/utils';
 
 interface PaymentQRDialogProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   orderId: string;
   planType: 'monthly' | 'yearly';
   amount: number;
   onPaymentConfirmed?: () => void;
 }
 
 interface PaymentSettings {
   wechat_qr_code: string;
   alipay_qr_code: string;
   customer_service_wechat: string;
   customer_service_phone: string;
   customer_service_qr_code: string;
 }
 
 export const PaymentQRDialog = ({
   open,
   onOpenChange,
   orderId,
   planType,
   amount,
   onPaymentConfirmed,
 }: PaymentQRDialogProps) => {
   const [settings, setSettings] = useState<PaymentSettings>({
     wechat_qr_code: '',
     alipay_qr_code: '',
     customer_service_wechat: '',
     customer_service_phone: '',
     customer_service_qr_code: '',
   });
   const [isLoading, setIsLoading] = useState(true);
   const [paymentMethod, setPaymentMethod] = useState<'wechat' | 'alipay'>('wechat');
   const [isCheckingPayment, setIsCheckingPayment] = useState(false);
 
   useEffect(() => {
     if (open) {
       fetchSettings();
     }
   }, [open]);
 
   const fetchSettings = async () => {
     setIsLoading(true);
     const { data } = await supabase
       .from('site_settings')
       .select('key, value')
       .in('key', [
         'wechat_qr_code',
         'alipay_qr_code',
         'customer_service_wechat',
         'customer_service_phone',
         'customer_service_qr_code',
       ]);
 
     if (data) {
       const settingsMap: Record<string, string> = {};
       data.forEach((s) => {
         settingsMap[s.key] = typeof s.value === 'string' ? s.value : String(s.value || '');
       });
       setSettings({
         wechat_qr_code: settingsMap.wechat_qr_code || '',
         alipay_qr_code: settingsMap.alipay_qr_code || '',
         customer_service_wechat: settingsMap.customer_service_wechat || '',
         customer_service_phone: settingsMap.customer_service_phone || '',
         customer_service_qr_code: settingsMap.customer_service_qr_code || '',
       });
     }
     setIsLoading(false);
   };
 
   const handleCheckPayment = async () => {
     setIsCheckingPayment(true);
     // Check if order status has been updated to 'paid'
     const { data } = await supabase
       .from('vip_orders')
       .select('status')
       .eq('id', orderId)
       .single();
 
     setIsCheckingPayment(false);
 
     if (data?.status === 'paid') {
       onPaymentConfirmed?.();
       onOpenChange(false);
     }
   };
 
   const currentQRCode = paymentMethod === 'wechat' ? settings.wechat_qr_code : settings.alipay_qr_code;
 
   return (
     <Dialog open={open} onOpenChange={onOpenChange}>
       <DialogContent className="sm:max-w-md">
         <DialogHeader>
           <DialogTitle className="text-center">扫码支付</DialogTitle>
         </DialogHeader>
 
         {isLoading ? (
           <div className="flex items-center justify-center py-12">
             <Loader2 className="h-8 w-8 animate-spin text-primary" />
           </div>
         ) : (
           <div className="space-y-4">
             {/* Order Info */}
             <div className="bg-muted/50 rounded-lg p-4 text-center">
               <p className="text-sm text-muted-foreground">
                 {planType === 'monthly' ? '月度会员' : '年度会员'}
               </p>
               <p className="text-2xl font-bold text-primary">¥{amount}</p>
               <p className="text-xs text-muted-foreground mt-1">订单号: {orderId.slice(0, 8)}...</p>
             </div>
 
             {/* Payment Method Tabs */}
             <Tabs value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as 'wechat' | 'alipay')}>
               <TabsList className="grid w-full grid-cols-2">
                 <TabsTrigger value="wechat" className="gap-2">
                   <span className="text-green-500">💬</span> 微信支付
                 </TabsTrigger>
                 <TabsTrigger value="alipay" className="gap-2">
                   <span className="text-blue-500">💳</span> 支付宝
                 </TabsTrigger>
               </TabsList>
 
               <TabsContent value="wechat" className="mt-4">
                 <QRCodeDisplay qrCode={settings.wechat_qr_code} label="微信" />
               </TabsContent>
               <TabsContent value="alipay" className="mt-4">
                 <QRCodeDisplay qrCode={settings.alipay_qr_code} label="支付宝" />
               </TabsContent>
             </Tabs>
 
             {/* Check Payment Button */}
             <Button 
               onClick={handleCheckPayment} 
               className="w-full" 
               variant="outline"
               disabled={isCheckingPayment}
             >
               {isCheckingPayment ? (
                 <>
                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                   查询中...
                 </>
               ) : (
                 <>
                   <CheckCircle2 className="mr-2 h-4 w-4" />
                   我已完成支付
                 </>
               )}
             </Button>
 
             {/* Customer Service */}
             <div className="border-t pt-4">
               <p className="text-sm text-center text-muted-foreground mb-3">
                 支付完成后请联系客服确认订单
               </p>
               <div className="flex flex-col gap-2">
                 {settings.customer_service_wechat && (
                   <div className="flex items-center justify-center gap-2 text-sm">
                     <MessageCircle className="h-4 w-4 text-green-500" />
                     <span className="text-muted-foreground">微信:</span>
                     <span className="font-medium">{settings.customer_service_wechat}</span>
                   </div>
                 )}
                 {settings.customer_service_phone && (
                   <div className="flex items-center justify-center gap-2 text-sm">
                     <Phone className="h-4 w-4 text-primary" />
                     <span className="text-muted-foreground">电话:</span>
                     <span className="font-medium">{settings.customer_service_phone}</span>
                   </div>
                 )}
                 {settings.customer_service_qr_code && (
                   <div className="flex flex-col items-center gap-2 mt-2">
                     <p className="text-xs text-muted-foreground">扫码添加客服微信</p>
                     <img 
                       src={settings.customer_service_qr_code} 
                       alt="客服二维码" 
                       className="w-24 h-24 rounded-lg border"
                     />
                   </div>
                 )}
               </div>
             </div>
           </div>
         )}
       </DialogContent>
     </Dialog>
   );
 };
 
 const QRCodeDisplay = ({ qrCode, label }: { qrCode: string; label: string }) => {
   if (!qrCode) {
     return (
       <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
         <QrCode className="h-12 w-12 mb-2 opacity-50" />
         <p className="text-sm">{label}支付二维码未配置</p>
         <p className="text-xs">请联系管理员</p>
       </div>
     );
   }
 
   return (
     <div className="flex flex-col items-center">
       <img 
         src={qrCode} 
         alt={`${label}支付二维码`} 
         className="w-48 h-48 rounded-lg border"
       />
       <p className="text-sm text-muted-foreground mt-2">
         请使用{label}扫描二维码完成支付
       </p>
     </div>
   );
 };
 import { useEffect, useState } from 'react';
 import { useNavigate } from 'react-router-dom';
 import { useAuth } from '@/hooks/useAuth';
 import { supabase } from '@/integrations/supabase/client';
 import { Header } from '@/components/Header';
 import { Footer } from '@/components/Footer';
 import { Button } from '@/components/ui/button';
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
 import { useToast } from '@/hooks/use-toast';
 import { Loader2, Crown, Check, Sparkles, Clock, Shield, Download, ExternalLink } from 'lucide-react';
 import { cn } from '@/lib/utils';
 import { PaymentQRDialog } from '@/components/PaymentQRDialog';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Gift } from 'lucide-react';
 
interface SiteSettings {
  vip_price_monthly: number;
  vip_price_yearly: number;
  card_key_purchase_link: string;
}
 
 interface UserProfile {
   is_vip: boolean;
   vip_expires_at: string | null;
 }
 
 const VipMembership = () => {
   const { user, isLoading: authLoading } = useAuth();
   const [settings, setSettings] = useState<SiteSettings>({ vip_price_monthly: 29, vip_price_yearly: 199, card_key_purchase_link: '' });
   const [profile, setProfile] = useState<UserProfile | null>(null);
   const [isLoading, setIsLoading] = useState(true);
   const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [showPaymentDialog, setShowPaymentDialog] = useState(false);
   const [currentOrderId, setCurrentOrderId] = useState<string>('');
   const [invitationCode, setInvitationCode] = useState('');
   const [isValidatingCode, setIsValidatingCode] = useState(false);
   const navigate = useNavigate();
   const { toast } = useToast();
 
   useEffect(() => {
     fetchData();
   }, [user]);
 
   const fetchData = async () => {
    // Fetch site settings
    const { data: settingsData } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['vip_price_monthly', 'vip_price_yearly', 'card_key_purchase_link']);

    if (settingsData) {
      const settingsMap: Record<string, any> = {};
      settingsData.forEach((s) => {
        settingsMap[s.key] = s.value;
      });
      setSettings({
        vip_price_monthly: typeof settingsMap.vip_price_monthly === 'number' ? settingsMap.vip_price_monthly : parseInt(settingsMap.vip_price_monthly as string) || 29,
        vip_price_yearly: typeof settingsMap.vip_price_yearly === 'number' ? settingsMap.vip_price_yearly : parseInt(settingsMap.vip_price_yearly as string) || 199,
        card_key_purchase_link: (settingsMap.card_key_purchase_link as string) || '',
      });
    }
 
     // Fetch user profile if logged in
     if (user) {
       const { data: profileData } = await supabase
         .from('profiles')
         .select('is_vip, vip_expires_at')
         .eq('user_id', user.id)
         .maybeSingle();
 
       if (profileData) {
         setProfile(profileData);
       }
     }
 
     setIsLoading(false);
   };
 
   const handleSubscribe = async () => {
     if (!user) {
       navigate('/auth');
       return;
     }
 
     setIsSubmitting(true);
 
     const amount = selectedPlan === 'monthly' ? settings.vip_price_monthly : settings.vip_price_yearly;
 
     // Create VIP order
     const { data, error } = await supabase
       .from('vip_orders')
       .insert({
         user_id: user.id,
         plan_type: selectedPlan,
         amount,
         status: 'pending',
       })
       .select()
       .single();
 
     setIsSubmitting(false);
 
     if (error) {
       toast({
         title: '订单创建失败',
         description: error.message,
         variant: 'destructive',
       });
       return;
     }
 
     // Show payment dialog
     setCurrentOrderId(data.id);
     setShowPaymentDialog(true);
   };
 
   const handleUseInvitationCode = async () => {
     if (!user) {
       navigate('/auth');
       return;
     }

     if (!invitationCode.trim()) {
       toast({ title: '请输入邀请码', variant: 'destructive' });
       return;
     }

     setIsValidatingCode(true);

     // Validate invitation code
     const { data: codeData, error: codeError } = await supabase
       .from('invitation_codes')
       .select('*')
       .eq('code', invitationCode.toUpperCase())
       .eq('is_active', true)
       .maybeSingle();

     if (codeError || !codeData) {
       setIsValidatingCode(false);
       toast({ title: '邀请码无效', description: '请检查邀请码是否正确', variant: 'destructive' });
       return;
     }

     // Check if code has remaining uses
     if (codeData.used_count >= codeData.max_uses) {
       setIsValidatingCode(false);
       toast({ title: '邀请码已用完', variant: 'destructive' });
       return;
     }

     // Check expiration
     if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) {
       setIsValidatingCode(false);
       toast({ title: '邀请码已过期', variant: 'destructive' });
       return;
     }

     // Create a paid order directly
     const { error: orderError } = await supabase.from('vip_orders').insert({
       user_id: user.id,
       plan_type: codeData.plan_type,
       amount: 0,
       status: 'paid',
       payment_method: 'invitation_code',
       payment_reference: codeData.code,
     });

     if (orderError) {
       setIsValidatingCode(false);
       toast({ title: '激活失败', description: orderError.message, variant: 'destructive' });
       return;
     }

     // Update code usage count
     await supabase
       .from('invitation_codes')
       .update({ used_count: codeData.used_count + 1 })
       .eq('id', codeData.id);

     // Record code usage
     await supabase.from('invitation_code_uses').insert({
       code_id: codeData.id,
       user_id: user.id,
     });

     setIsValidatingCode(false);
     toast({
       title: '🎉 会员激活成功',
       description: `您已成功开通${codeData.plan_type === 'yearly' ? '年度' : '月度'}会员`,
     });

     navigate('/profile');
   };
 
   const handlePaymentConfirmed = () => {
     toast({
       title: '支付确认成功',
       description: '您的会员已成功开通！',
     });
     navigate('/profile');
   };

   const isVipActive = profile?.is_vip && profile?.vip_expires_at && new Date(profile.vip_expires_at) > new Date();
 
   if (authLoading || isLoading) {
     return (
       <div className="min-h-screen bg-background flex items-center justify-center">
         <Loader2 className="h-8 w-8 animate-spin text-primary" />
       </div>
     );
   }
 
   const features = [
     { icon: Download, text: '无限下载所有VIP资料' },
     { icon: Sparkles, text: '专属VIP内容解锁' },
     { icon: Clock, text: '第一时间获取最新资料' },
     { icon: Shield, text: '专属客服支持' },
   ];
 
   const monthlyPrice = settings.vip_price_monthly;
   const yearlyPrice = settings.vip_price_yearly;
   const yearlySavings = Math.round((1 - yearlyPrice / (monthlyPrice * 12)) * 100);
 
   return (
     <div className="min-h-screen bg-background">
       <Header />
        <main className="container py-4 md:py-8">
          <div className="max-w-4xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-6 md:mb-12">
              <div className="inline-flex items-center justify-center w-14 h-14 md:w-20 md:h-20 rounded-full bg-gradient-accent mb-4 md:mb-6">
                <Crown className="w-7 h-7 md:w-10 md:h-10 text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2 md:mb-4">开通VIP会员</h1>
              <p className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto">
                解锁全站VIP专属资料，畅享无限下载
              </p>
            </div>
 
           {/* Current VIP Status */}
           {isVipActive && (
             <Card className="mb-8 border-accent bg-accent/5">
               <CardContent className="pt-6">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full bg-gradient-accent flex items-center justify-center">
                     <Crown className="w-6 h-6 text-white" />
                   </div>
                   <div>
                     <p className="font-semibold text-lg">您已是VIP会员</p>
                     <p className="text-muted-foreground">
                       有效期至: {new Date(profile!.vip_expires_at!).toLocaleDateString('zh-CN')}
                     </p>
                   </div>
                 </div>
               </CardContent>
             </Card>
           )}
 
           {/* Pricing Cards */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-12">
             {/* Monthly Plan */}
             <Card 
               className={cn(
                 "relative cursor-pointer transition-all",
                 selectedPlan === 'monthly' 
                   ? "border-primary ring-2 ring-primary/20" 
                   : "hover:border-primary/50"
               )}
               onClick={() => setSelectedPlan('monthly')}
             >
               <CardHeader>
                 <CardTitle>月度会员</CardTitle>
                 <CardDescription>适合短期备考</CardDescription>
               </CardHeader>
               <CardContent>
                 <div className="flex items-baseline gap-1 mb-6">
                   <span className="text-4xl font-bold">¥{monthlyPrice}</span>
                   <span className="text-muted-foreground">/月</span>
                 </div>
                 <ul className="space-y-3">
                   {features.map((feature, index) => (
                     <li key={index} className="flex items-center gap-3">
                       <Check className="w-5 h-5 text-success" />
                       <span className="text-sm">{feature.text}</span>
                     </li>
                   ))}
                 </ul>
               </CardContent>
             </Card>
 
             {/* Yearly Plan */}
             <Card 
               className={cn(
                 "relative cursor-pointer transition-all",
                 selectedPlan === 'yearly' 
                   ? "border-primary ring-2 ring-primary/20" 
                   : "hover:border-primary/50"
               )}
               onClick={() => setSelectedPlan('yearly')}
             >
               {yearlySavings > 0 && (
                 <div className="absolute -top-3 -right-3 bg-gradient-accent text-white text-xs font-bold px-3 py-1 rounded-full">
                   省{yearlySavings}%
                 </div>
               )}
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   年度会员
                   <span className="tag-hot">推荐</span>
                 </CardTitle>
                 <CardDescription>最划算的选择</CardDescription>
               </CardHeader>
               <CardContent>
                 <div className="flex items-baseline gap-1 mb-2">
                   <span className="text-4xl font-bold">¥{yearlyPrice}</span>
                   <span className="text-muted-foreground">/年</span>
                 </div>
                 <p className="text-sm text-muted-foreground mb-6">
                   相当于 ¥{(yearlyPrice / 12).toFixed(1)}/月
                 </p>
                 <ul className="space-y-3">
                   {features.map((feature, index) => (
                     <li key={index} className="flex items-center gap-3">
                       <Check className="w-5 h-5 text-success" />
                       <span className="text-sm">{feature.text}</span>
                     </li>
                   ))}
                 </ul>
               </CardContent>
             </Card>
           </div>
 
            {/* Subscribe Button */}
            <div className="text-center space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-gradient-accent hover:opacity-90 text-white px-12 py-6 text-lg"
                  onClick={handleSubscribe}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      处理中...
                    </>
                  ) : isVipActive ? (
                    <>
                      <Crown className="w-5 h-5 mr-2" />
                      续费会员
                    </>
                  ) : (
                    <>
                      <Crown className="w-5 h-5 mr-2" />
                      立即开通
                    </>
                  )}
                </Button>
                {settings.card_key_purchase_link && (
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="px-12 py-6 text-lg"
                    onClick={() => window.open(settings.card_key_purchase_link, '_blank')}
                  >
                    <ExternalLink className="w-5 h-5 mr-2" />
                    购买卡密开通
                  </Button>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                支付完成后，请联系客服确认订单，会员权益将立即生效
              </p>
            </div>

             {/* Invitation Code Section */}
             <div className="border-t pt-8 mt-8">
               <div className="text-center mb-6">
                 <h2 className="text-xl font-semibold flex items-center justify-center gap-2">
                   <Gift className="w-5 h-5 text-accent" />
                   使用邀请码
                 </h2>
                 <p className="text-sm text-muted-foreground mt-1">
                   有邀请码？输入后立即免费开通会员
                 </p>
               </div>
               <div className="max-w-sm mx-auto flex gap-2">
                 <Input
                   placeholder="请输入邀请码"
                   value={invitationCode}
                   onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
                   className="text-center font-mono text-lg tracking-wider"
                 />
                 <Button
                   onClick={handleUseInvitationCode}
                   disabled={isValidatingCode || !invitationCode.trim()}
                   variant="outline"
                 >
                   {isValidatingCode ? (
                     <Loader2 className="w-4 h-4 animate-spin" />
                   ) : (
                     '激活'
                   )}
                 </Button>
               </div>
             </div>
         </div>
       </main>
       <Footer />

         {/* Payment QR Dialog */}
         <PaymentQRDialog
           open={showPaymentDialog}
           onOpenChange={setShowPaymentDialog}
           orderId={currentOrderId}
           planType={selectedPlan}
           amount={selectedPlan === 'monthly' ? settings.vip_price_monthly : settings.vip_price_yearly}
           onPaymentConfirmed={handlePaymentConfirmed}
         />
     </div>
   );
 };
 
 export default VipMembership;
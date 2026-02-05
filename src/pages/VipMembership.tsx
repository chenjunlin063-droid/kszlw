 import { useEffect, useState } from 'react';
 import { useNavigate } from 'react-router-dom';
 import { useAuth } from '@/hooks/useAuth';
 import { supabase } from '@/integrations/supabase/client';
 import { Header } from '@/components/Header';
 import { Footer } from '@/components/Footer';
 import { Button } from '@/components/ui/button';
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
 import { useToast } from '@/hooks/use-toast';
 import { Loader2, Crown, Check, Sparkles, Clock, Shield, Download } from 'lucide-react';
 import { cn } from '@/lib/utils';
 
 interface SiteSettings {
   vip_price_monthly: number;
   vip_price_yearly: number;
 }
 
 interface UserProfile {
   is_vip: boolean;
   vip_expires_at: string | null;
 }
 
 const VipMembership = () => {
   const { user, isLoading: authLoading } = useAuth();
   const [settings, setSettings] = useState<SiteSettings>({ vip_price_monthly: 29, vip_price_yearly: 199 });
   const [profile, setProfile] = useState<UserProfile | null>(null);
   const [isLoading, setIsLoading] = useState(true);
   const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
   const [isSubmitting, setIsSubmitting] = useState(false);
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
       .in('key', ['vip_price_monthly', 'vip_price_yearly']);
 
     if (settingsData) {
       const settingsMap: Record<string, number> = {};
       settingsData.forEach((s) => {
         settingsMap[s.key] = typeof s.value === 'number' ? s.value : parseInt(s.value as string) || 0;
       });
       setSettings({
         vip_price_monthly: settingsMap.vip_price_monthly || 29,
         vip_price_yearly: settingsMap.vip_price_yearly || 199,
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
 
     toast({
       title: '订单已创建',
       description: '请联系客服完成支付，支付后会员将自动开通',
     });
 
     // Navigate to profile to see order status
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
       <main className="container py-8">
         <div className="max-w-4xl mx-auto">
           {/* Hero Section */}
           <div className="text-center mb-12">
             <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-accent mb-6">
               <Crown className="w-10 h-10 text-white" />
             </div>
             <h1 className="text-3xl font-bold mb-4">开通VIP会员</h1>
             <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
               解锁全站VIP专属资料，畅享无限下载，助力考试成功
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
           <div className="grid md:grid-cols-2 gap-6 mb-12">
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
           <div className="text-center">
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
             <p className="text-sm text-muted-foreground mt-4">
               支付完成后，请联系客服确认订单，会员权益将立即生效
             </p>
           </div>
         </div>
       </main>
       <Footer />
     </div>
   );
 };
 
 export default VipMembership;
 import { Link } from 'react-router-dom';
 import { Card, CardContent } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Crown, Calendar, ArrowRight } from 'lucide-react';
 
 interface VipStatusCardProps {
   isVip: boolean;
   expiresAt: string | null;
 }
 
 export const VipStatusCard = ({ isVip, expiresAt }: VipStatusCardProps) => {
   const isActive = isVip && expiresAt && new Date(expiresAt) > new Date();
   const daysLeft = expiresAt 
     ? Math.ceil((new Date(expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
     : 0;
 
   if (isActive) {
     return (
       <Card className="border-accent bg-gradient-to-br from-accent/10 to-accent/5">
         <CardContent className="pt-6">
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-4">
               <div className="w-14 h-14 rounded-full bg-gradient-accent flex items-center justify-center">
                 <Crown className="w-7 h-7 text-white" />
               </div>
               <div>
                 <div className="flex items-center gap-2">
                   <p className="font-bold text-lg">VIP会员</p>
                   <span className="tag-vip">已开通</span>
                 </div>
                 <div className="flex items-center gap-2 text-muted-foreground mt-1">
                   <Calendar className="w-4 h-4" />
                   <span className="text-sm">
                     {daysLeft > 0 
                       ? `剩余 ${daysLeft} 天 · 到期时间: ${new Date(expiresAt!).toLocaleDateString('zh-CN')}`
                       : '即将到期'
                     }
                   </span>
                 </div>
               </div>
             </div>
             <Link to="/vip">
               <Button variant="outline" className="border-accent text-accent hover:bg-accent hover:text-white">
                 续费会员
                 <ArrowRight className="w-4 h-4 ml-2" />
               </Button>
             </Link>
           </div>
         </CardContent>
       </Card>
     );
   }
 
   return (
     <Card className="border-dashed border-2 bg-muted/30">
       <CardContent className="pt-6">
         <div className="flex items-center justify-between">
           <div className="flex items-center gap-4">
             <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
               <Crown className="w-7 h-7 text-muted-foreground" />
             </div>
             <div>
               <p className="font-bold text-lg">开通VIP会员</p>
               <p className="text-sm text-muted-foreground mt-1">
                 解锁全站VIP专属资料，畅享无限下载
               </p>
             </div>
           </div>
           <Link to="/vip">
             <Button className="bg-gradient-accent hover:opacity-90 text-white">
               <Crown className="w-4 h-4 mr-2" />
               立即开通
             </Button>
           </Link>
         </div>
       </CardContent>
     </Card>
   );
 };
 import { useEffect, useState } from 'react';
 import { supabase } from '@/integrations/supabase/client';
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
 import { Badge } from '@/components/ui/badge';
 import { Loader2, Crown } from 'lucide-react';
 
 interface VipOrder {
   id: string;
   plan_type: string;
   amount: number;
   status: string;
   created_at: string;
   expires_at: string | null;
 }
 
 interface VipOrderHistoryProps {
   userId: string;
 }
 
 export const VipOrderHistory = ({ userId }: VipOrderHistoryProps) => {
   const [orders, setOrders] = useState<VipOrder[]>([]);
   const [isLoading, setIsLoading] = useState(true);
 
   useEffect(() => {
     fetchOrders();
   }, [userId]);
 
   const fetchOrders = async () => {
     const { data } = await supabase
       .from('vip_orders')
       .select('id, plan_type, amount, status, created_at, expires_at')
       .eq('user_id', userId)
       .order('created_at', { ascending: false })
       .limit(10);
 
     if (data) {
       setOrders(data);
     }
     setIsLoading(false);
   };
 
   const getStatusBadge = (status: string) => {
     switch (status) {
       case 'pending':
         return <Badge variant="outline" className="text-warning border-warning">待支付</Badge>;
       case 'paid':
         return <Badge className="bg-success">已支付</Badge>;
       case 'cancelled':
         return <Badge variant="secondary">已取消</Badge>;
       default:
         return <Badge variant="outline">{status}</Badge>;
     }
   };
 
   if (isLoading) {
     return (
       <Card>
         <CardContent className="py-12 flex justify-center">
           <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
         </CardContent>
       </Card>
     );
   }
 
   return (
     <Card>
       <CardHeader>
         <CardTitle className="flex items-center gap-2">
           <Crown className="w-5 h-5" />
           会员订单
         </CardTitle>
         <CardDescription>您的VIP会员订单记录</CardDescription>
       </CardHeader>
       <CardContent>
         {orders.length === 0 ? (
           <p className="text-muted-foreground text-center py-8">
             暂无订单记录
           </p>
         ) : (
           <div className="space-y-3">
             {orders.map((order) => (
               <div
                 key={order.id}
                 className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
               >
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-gradient-accent flex items-center justify-center">
                     <Crown className="w-5 h-5 text-white" />
                   </div>
                   <div>
                     <p className="font-medium">
                       {order.plan_type === 'monthly' ? '月度会员' : '年度会员'}
                     </p>
                     <p className="text-sm text-muted-foreground">
                       {new Date(order.created_at).toLocaleString('zh-CN')}
                     </p>
                   </div>
                 </div>
                 <div className="text-right">
                   <p className="font-semibold">¥{Number(order.amount).toFixed(2)}</p>
                   {getStatusBadge(order.status)}
                 </div>
               </div>
             ))}
           </div>
         )}
       </CardContent>
     </Card>
   );
 };
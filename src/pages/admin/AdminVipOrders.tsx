 import { useEffect, useState } from 'react';
 import { supabase } from '@/integrations/supabase/client';
 import { Button } from '@/components/ui/button';
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
 import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
 import { Badge } from '@/components/ui/badge';
 import { useToast } from '@/hooks/use-toast';
 import { Loader2, Check, X, Crown, RefreshCw } from 'lucide-react';
 import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
 } from '@/components/ui/alert-dialog';
 
 interface VipOrder {
   id: string;
   user_id: string;
   plan_type: string;
   amount: number;
   status: 'pending' | 'paid' | 'cancelled' | 'expired';
   payment_method: string | null;
   payment_reference: string | null;
   created_at: string;
   paid_at: string | null;
   expires_at: string | null;
   user_email?: string;
 }
 
 const AdminVipOrders = () => {
   const [orders, setOrders] = useState<VipOrder[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [actionOrder, setActionOrder] = useState<VipOrder | null>(null);
   const [actionType, setActionType] = useState<'approve' | 'cancel' | null>(null);
   const [isProcessing, setIsProcessing] = useState(false);
   const { toast } = useToast();
 
   useEffect(() => {
     fetchOrders();
   }, []);
 
   const fetchOrders = async () => {
     setIsLoading(true);
     
     const { data, error } = await supabase
       .from('vip_orders')
       .select('*')
       .order('created_at', { ascending: false });
 
     if (error) {
       toast({ title: '加载失败', description: error.message, variant: 'destructive' });
     } else {
       setOrders(data || []);
     }
     
     setIsLoading(false);
   };
 
   const handleAction = async () => {
     if (!actionOrder || !actionType) return;
 
     setIsProcessing(true);
 
     const newStatus = actionType === 'approve' ? 'paid' : 'cancelled';
 
     const { error } = await supabase
       .from('vip_orders')
       .update({ status: newStatus })
       .eq('id', actionOrder.id);
 
     setIsProcessing(false);
     setActionOrder(null);
     setActionType(null);
 
     if (error) {
       toast({ title: '操作失败', description: error.message, variant: 'destructive' });
     } else {
       toast({ 
         title: actionType === 'approve' ? '订单已确认' : '订单已取消',
         description: actionType === 'approve' ? 'VIP会员已自动开通' : '订单已标记为取消',
       });
       fetchOrders();
     }
   };
 
   const getStatusBadge = (status: string) => {
     switch (status) {
       case 'pending':
         return <Badge variant="outline" className="text-warning border-warning">待支付</Badge>;
       case 'paid':
         return <Badge className="bg-success">已支付</Badge>;
       case 'cancelled':
         return <Badge variant="secondary">已取消</Badge>;
       case 'expired':
         return <Badge variant="destructive">已过期</Badge>;
       default:
         return <Badge variant="outline">{status}</Badge>;
     }
   };
 
   const getPlanLabel = (plan: string) => {
     return plan === 'monthly' ? '月度会员' : '年度会员';
   };
 
   // Calculate stats
   const stats = {
     total: orders.length,
     pending: orders.filter(o => o.status === 'pending').length,
     paid: orders.filter(o => o.status === 'paid').length,
     revenue: orders.filter(o => o.status === 'paid').reduce((sum, o) => sum + Number(o.amount), 0),
   };
 
   if (isLoading) {
     return (
       <div className="flex items-center justify-center py-12">
         <Loader2 className="w-8 h-8 animate-spin text-primary" />
       </div>
     );
   }
 
   return (
     <div>
       <div className="flex items-center justify-between mb-6">
         <div>
           <h1 className="text-2xl font-bold">VIP订单管理</h1>
           <p className="text-muted-foreground">管理会员订单和开通会员</p>
         </div>
         <Button variant="outline" onClick={fetchOrders}>
           <RefreshCw className="w-4 h-4 mr-2" />
           刷新
         </Button>
       </div>
 
       {/* Stats Cards */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
         <Card>
           <CardContent className="pt-6">
             <div className="text-2xl font-bold">{stats.total}</div>
             <p className="text-muted-foreground text-sm">总订单数</p>
           </CardContent>
         </Card>
         <Card>
           <CardContent className="pt-6">
             <div className="text-2xl font-bold text-warning">{stats.pending}</div>
             <p className="text-muted-foreground text-sm">待处理</p>
           </CardContent>
         </Card>
         <Card>
           <CardContent className="pt-6">
             <div className="text-2xl font-bold text-success">{stats.paid}</div>
             <p className="text-muted-foreground text-sm">已完成</p>
           </CardContent>
         </Card>
         <Card>
           <CardContent className="pt-6">
             <div className="text-2xl font-bold">¥{stats.revenue.toFixed(2)}</div>
             <p className="text-muted-foreground text-sm">总收入</p>
           </CardContent>
         </Card>
       </div>
 
       {/* Orders Table */}
       <Card>
         <CardHeader>
           <CardTitle className="flex items-center gap-2">
             <Crown className="w-5 h-5" />
             订单列表
           </CardTitle>
           <CardDescription>查看和管理所有VIP会员订单</CardDescription>
         </CardHeader>
         <CardContent>
           {orders.length === 0 ? (
             <div className="text-center py-12 text-muted-foreground">
               暂无订单
             </div>
           ) : (
             <Table>
               <TableHeader>
                 <TableRow>
                   <TableHead>订单ID</TableHead>
                   <TableHead>用户ID</TableHead>
                   <TableHead>套餐</TableHead>
                   <TableHead>金额</TableHead>
                   <TableHead>状态</TableHead>
                   <TableHead>创建时间</TableHead>
                   <TableHead>到期时间</TableHead>
                   <TableHead className="text-right">操作</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {orders.map((order) => (
                   <TableRow key={order.id}>
                     <TableCell className="font-mono text-xs">
                       {order.id.slice(0, 8)}...
                     </TableCell>
                     <TableCell className="font-mono text-xs">
                       {order.user_id.slice(0, 8)}...
                     </TableCell>
                     <TableCell>{getPlanLabel(order.plan_type)}</TableCell>
                     <TableCell>¥{Number(order.amount).toFixed(2)}</TableCell>
                     <TableCell>{getStatusBadge(order.status)}</TableCell>
                     <TableCell>
                       {new Date(order.created_at).toLocaleString('zh-CN')}
                     </TableCell>
                     <TableCell>
                       {order.expires_at 
                         ? new Date(order.expires_at).toLocaleDateString('zh-CN')
                         : '-'
                       }
                     </TableCell>
                     <TableCell className="text-right">
                       {order.status === 'pending' && (
                         <div className="flex justify-end gap-2">
                           <Button
                             size="sm"
                             variant="default"
                             onClick={() => {
                               setActionOrder(order);
                               setActionType('approve');
                             }}
                           >
                             <Check className="w-4 h-4 mr-1" />
                             确认
                           </Button>
                           <Button
                             size="sm"
                             variant="outline"
                             onClick={() => {
                               setActionOrder(order);
                               setActionType('cancel');
                             }}
                           >
                             <X className="w-4 h-4 mr-1" />
                             取消
                           </Button>
                         </div>
                       )}
                     </TableCell>
                   </TableRow>
                 ))}
               </TableBody>
             </Table>
           )}
         </CardContent>
       </Card>
 
       {/* Confirmation Dialog */}
       <AlertDialog open={!!actionOrder} onOpenChange={() => { setActionOrder(null); setActionType(null); }}>
         <AlertDialogContent>
           <AlertDialogHeader>
             <AlertDialogTitle>
               {actionType === 'approve' ? '确认支付' : '取消订单'}
             </AlertDialogTitle>
             <AlertDialogDescription>
               {actionType === 'approve' 
                 ? '确认后将自动为用户开通VIP会员，此操作不可撤销。'
                 : '确定要取消这个订单吗？'
               }
             </AlertDialogDescription>
           </AlertDialogHeader>
           <AlertDialogFooter>
             <AlertDialogCancel disabled={isProcessing}>取消</AlertDialogCancel>
             <AlertDialogAction onClick={handleAction} disabled={isProcessing}>
               {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
               确认
             </AlertDialogAction>
           </AlertDialogFooter>
         </AlertDialogContent>
       </AlertDialog>
     </div>
   );
 };
 
 export default AdminVipOrders;
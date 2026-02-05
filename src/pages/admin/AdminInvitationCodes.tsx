 import { useEffect, useState } from 'react';
 import { supabase } from '@/integrations/supabase/client';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
 import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
 import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
 import { Badge } from '@/components/ui/badge';
 import { useToast } from '@/hooks/use-toast';
 import { Loader2, Plus, Copy, Trash2, Gift } from 'lucide-react';
 
 interface InvitationCode {
   id: string;
   code: string;
   plan_type: string;
   max_uses: number;
   used_count: number;
   is_active: boolean;
   expires_at: string | null;
   created_at: string;
 }
 
 const generateRandomCode = () => {
   const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
   let code = '';
   for (let i = 0; i < 8; i++) {
     code += chars.charAt(Math.floor(Math.random() * chars.length));
   }
   return code;
 };
 
 const AdminInvitationCodes = () => {
   const [codes, setCodes] = useState<InvitationCode[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [isDialogOpen, setIsDialogOpen] = useState(false);
   const [isSaving, setIsSaving] = useState(false);
   const { toast } = useToast();
 
  // Form state
  const [newCode, setNewCode] = useState(generateRandomCode());
  const [planType, setPlanType] = useState('monthly');
  const [maxUses, setMaxUses] = useState(1);
  const [expiresAt, setExpiresAt] = useState('');
  const [batchCount, setBatchCount] = useState(1);
 
   useEffect(() => {
     fetchCodes();
   }, []);
 
   const fetchCodes = async () => {
     const { data, error } = await supabase
       .from('invitation_codes')
       .select('*')
       .order('created_at', { ascending: false });
 
     if (data) {
       setCodes(data);
     }
     setIsLoading(false);
   };
 
  const handleCreate = async () => {
    if (batchCount === 1 && !newCode.trim()) {
      toast({ title: '请输入邀请码', variant: 'destructive' });
      return;
    }

    if (batchCount < 1 || batchCount > 100) {
      toast({ title: '批量生成数量需在1-100之间', variant: 'destructive' });
      return;
    }

    setIsSaving(true);

    // Generate codes to insert
    const codesToInsert = [];
    if (batchCount === 1) {
      codesToInsert.push({
        code: newCode.toUpperCase(),
        plan_type: planType,
        max_uses: maxUses,
        expires_at: expiresAt || null,
      });
    } else {
      for (let i = 0; i < batchCount; i++) {
        codesToInsert.push({
          code: generateRandomCode(),
          plan_type: planType,
          max_uses: maxUses,
          expires_at: expiresAt || null,
        });
      }
    }

    const { error } = await supabase.from('invitation_codes').insert(codesToInsert);

    setIsSaving(false);

    if (error) {
      toast({ title: '创建失败', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: batchCount === 1 ? '邀请码创建成功' : `成功生成 ${batchCount} 个邀请码` });
    setIsDialogOpen(false);
    setNewCode(generateRandomCode());
    setPlanType('monthly');
    setMaxUses(1);
    setExpiresAt('');
    setBatchCount(1);
    fetchCodes();
  };
 
   const handleDelete = async (id: string) => {
     if (!confirm('确定要删除这个邀请码吗？')) return;
 
     const { error } = await supabase.from('invitation_codes').delete().eq('id', id);
 
     if (error) {
       toast({ title: '删除失败', description: error.message, variant: 'destructive' });
       return;
     }
 
     toast({ title: '删除成功' });
     fetchCodes();
   };
 
   const handleToggleActive = async (id: string, currentActive: boolean) => {
     const { error } = await supabase
       .from('invitation_codes')
       .update({ is_active: !currentActive })
       .eq('id', id);
 
     if (error) {
       toast({ title: '更新失败', description: error.message, variant: 'destructive' });
       return;
     }
 
     fetchCodes();
   };
 
   const copyToClipboard = (code: string) => {
     navigator.clipboard.writeText(code);
     toast({ title: '已复制到剪贴板' });
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
           <h1 className="text-2xl font-bold">邀请码管理</h1>
           <p className="text-muted-foreground">创建和管理会员邀请码</p>
         </div>
         <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
           <DialogTrigger asChild>
             <Button>
               <Plus className="w-4 h-4 mr-2" />
               生成邀请码
             </Button>
           </DialogTrigger>
           <DialogContent>
             <DialogHeader>
               <DialogTitle>生成邀请码</DialogTitle>
             </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>批量生成数量</Label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={batchCount}
                  onChange={(e) => setBatchCount(parseInt(e.target.value) || 1)}
                  placeholder="1-100"
                />
                <p className="text-xs text-muted-foreground">输入1为单个生成，大于1则批量随机生成</p>
              </div>
              {batchCount === 1 && (
                <div className="space-y-2">
                  <Label>邀请码</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                      placeholder="输入或自动生成"
                    />
                    <Button variant="outline" onClick={() => setNewCode(generateRandomCode())}>
                      随机
                    </Button>
                  </div>
                </div>
              )}
               <div className="space-y-2">
                 <Label>会员类型</Label>
                 <Select value={planType} onValueChange={setPlanType}>
                   <SelectTrigger>
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="monthly">月度会员</SelectItem>
                     <SelectItem value="yearly">年度会员</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
               <div className="space-y-2">
                 <Label>可使用次数</Label>
                 <Input
                   type="number"
                   min={1}
                   value={maxUses}
                   onChange={(e) => setMaxUses(parseInt(e.target.value) || 1)}
                 />
               </div>
               <div className="space-y-2">
                 <Label>过期时间（可选）</Label>
                 <Input
                   type="datetime-local"
                   value={expiresAt}
                   onChange={(e) => setExpiresAt(e.target.value)}
                 />
               </div>
               <Button onClick={handleCreate} disabled={isSaving} className="w-full">
                 {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Gift className="w-4 h-4 mr-2" />}
                 创建邀请码
               </Button>
             </div>
           </DialogContent>
         </Dialog>
       </div>
 
       <div className="rounded-md border">
         <Table>
           <TableHeader>
             <TableRow>
               <TableHead>邀请码</TableHead>
               <TableHead>会员类型</TableHead>
               <TableHead>使用情况</TableHead>
               <TableHead>过期时间</TableHead>
               <TableHead>状态</TableHead>
               <TableHead>创建时间</TableHead>
               <TableHead className="text-right">操作</TableHead>
             </TableRow>
           </TableHeader>
           <TableBody>
             {codes.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                   暂无邀请码
                 </TableCell>
               </TableRow>
             ) : (
               codes.map((code) => (
                 <TableRow key={code.id}>
                   <TableCell>
                     <div className="flex items-center gap-2">
                       <code className="bg-muted px-2 py-1 rounded font-mono">{code.code}</code>
                       <Button
                         variant="ghost"
                         size="icon"
                         className="h-6 w-6"
                         onClick={() => copyToClipboard(code.code)}
                       >
                         <Copy className="h-3 w-3" />
                       </Button>
                     </div>
                   </TableCell>
                   <TableCell>
                     <Badge variant={code.plan_type === 'yearly' ? 'default' : 'secondary'}>
                       {code.plan_type === 'yearly' ? '年度会员' : '月度会员'}
                     </Badge>
                   </TableCell>
                   <TableCell>
                     {code.used_count} / {code.max_uses}
                   </TableCell>
                   <TableCell>
                     {code.expires_at
                       ? new Date(code.expires_at).toLocaleDateString('zh-CN')
                       : '永不过期'}
                   </TableCell>
                   <TableCell>
                     <Badge
                       variant={code.is_active ? 'default' : 'secondary'}
                       className="cursor-pointer"
                       onClick={() => handleToggleActive(code.id, code.is_active)}
                     >
                       {code.is_active ? '有效' : '已禁用'}
                     </Badge>
                   </TableCell>
                   <TableCell>
                     {new Date(code.created_at).toLocaleDateString('zh-CN')}
                   </TableCell>
                   <TableCell className="text-right">
                     <Button
                       variant="ghost"
                       size="icon"
                       onClick={() => handleDelete(code.id)}
                       className="text-destructive hover:text-destructive"
                     >
                       <Trash2 className="h-4 w-4" />
                     </Button>
                   </TableCell>
                 </TableRow>
               ))
             )}
           </TableBody>
         </Table>
       </div>
     </div>
   );
 };
 
 export default AdminInvitationCodes;
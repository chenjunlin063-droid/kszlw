import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Loader2, Pin } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Announcement {
  id: string;
  title: string;
  content: string | null;
  type: string | null;
  link: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean | null;
  is_pinned: boolean | null;
  created_at: string;
}

const announcementTypes = [
  { value: 'info', label: '普通通知' },
  { value: 'promo', label: '促销活动' },
  { value: 'warning', label: '警告提示' },
  { value: 'success', label: '成功提示' },
];

const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'info',
    link: '',
    start_date: '',
    end_date: '',
    is_active: true,
    is_pinned: false,
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setAnnouncements(data);
    setIsLoading(false);
  };

  const handleOpenDialog = (announcement?: Announcement) => {
    if (announcement) {
      setEditingAnnouncement(announcement);
      setFormData({
        title: announcement.title,
        content: announcement.content || '',
        type: announcement.type || 'info',
        link: announcement.link || '',
        start_date: announcement.start_date?.split('T')[0] || '',
        end_date: announcement.end_date?.split('T')[0] || '',
        is_active: announcement.is_active ?? true,
        is_pinned: announcement.is_pinned ?? false,
      });
    } else {
      setEditingAnnouncement(null);
      setFormData({
        title: '',
        content: '',
        type: 'info',
        link: '',
        start_date: '',
        end_date: '',
        is_active: true,
        is_pinned: false,
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const announcementData = {
      title: formData.title,
      content: formData.content || null,
      type: formData.type,
      link: formData.link || null,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      is_active: formData.is_active,
      is_pinned: formData.is_pinned,
    };

    let error;
    if (editingAnnouncement) {
      const result = await supabase.from('announcements').update(announcementData).eq('id', editingAnnouncement.id);
      error = result.error;
    } else {
      const result = await supabase.from('announcements').insert(announcementData);
      error = result.error;
    }

    setIsSaving(false);

    if (error) {
      toast({ title: '操作失败', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: editingAnnouncement ? '更新成功' : '创建成功' });
      setDialogOpen(false);
      fetchAnnouncements();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条公告吗？')) return;

    const { error } = await supabase.from('announcements').delete().eq('id', id);

    if (error) {
      toast({ title: '删除失败', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: '删除成功' });
      fetchAnnouncements();
    }
  };

  const getTypeLabel = (type: string | null) => {
    return announcementTypes.find((t) => t.value === type)?.label || '未知';
  };

  const getTypeStyle = (type: string | null) => {
    switch (type) {
      case 'promo': return 'bg-accent/10 text-accent';
      case 'warning': return 'bg-yellow-500/10 text-yellow-600';
      case 'success': return 'bg-success/10 text-success';
      default: return 'bg-primary/10 text-primary';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">公告管理</h1>
          <p className="text-muted-foreground">管理网站公告和通知</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              添加公告
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingAnnouncement ? '编辑公告' : '添加公告'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">公告标题 *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="如：🎉 2024年一建真题已更新"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">公告内容</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="公告详细内容"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>公告类型</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {announcementTypes.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="link">链接地址</Label>
                  <Input
                    id="link"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    placeholder="/free 或 https://..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">开始日期</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">结束日期</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">启用</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_pinned"
                    checked={formData.is_pinned}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_pinned: checked })}
                  />
                  <Label htmlFor="is_pinned">置顶</Label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingAnnouncement ? '更新' : '创建'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>标题</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>有效期</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : announcements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                announcements.map((announcement) => (
                  <TableRow key={announcement.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {announcement.is_pinned && <Pin className="w-4 h-4 text-accent" />}
                        <span className="font-medium">{announcement.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getTypeStyle(announcement.type)}`}>
                        {getTypeLabel(announcement.type)}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {announcement.start_date && announcement.end_date
                        ? `${announcement.start_date.split('T')[0]} ~ ${announcement.end_date.split('T')[0]}`
                        : '长期有效'}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        announcement.is_active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                      }`}>
                        {announcement.is_active ? '启用' : '禁用'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(announcement)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(announcement.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnnouncements;

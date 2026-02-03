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
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Exam {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  category_id: string | null;
  exam_date: string | null;
  is_hot: boolean | null;
  is_active: boolean | null;
  sort_order: number | null;
}

interface Category {
  id: string;
  name: string;
}

const AdminExams = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    category_id: '',
    exam_date: '',
    is_hot: false,
    is_active: true,
    sort_order: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [examsRes, categoriesRes] = await Promise.all([
      supabase.from('exams').select('*').order('sort_order', { ascending: true }),
      supabase.from('exam_categories').select('id, name').eq('is_active', true),
    ]);

    if (examsRes.data) setExams(examsRes.data);
    if (categoriesRes.data) setCategories(categoriesRes.data);
    setIsLoading(false);
  };

  const handleOpenDialog = (exam?: Exam) => {
    if (exam) {
      setEditingExam(exam);
      setFormData({
        name: exam.name,
        slug: exam.slug,
        description: exam.description || '',
        icon: exam.icon || '',
        category_id: exam.category_id || '',
        exam_date: exam.exam_date || '',
        is_hot: exam.is_hot ?? false,
        is_active: exam.is_active ?? true,
        sort_order: exam.sort_order || 0,
      });
    } else {
      setEditingExam(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        icon: '',
        category_id: '',
        exam_date: '',
        is_hot: false,
        is_active: true,
        sort_order: 0,
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const examData = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description || null,
      icon: formData.icon || null,
      category_id: formData.category_id || null,
      exam_date: formData.exam_date || null,
      is_hot: formData.is_hot,
      is_active: formData.is_active,
      sort_order: formData.sort_order,
    };

    let error;
    if (editingExam) {
      const result = await supabase.from('exams').update(examData).eq('id', editingExam.id);
      error = result.error;
    } else {
      const result = await supabase.from('exams').insert(examData);
      error = result.error;
    }

    setIsSaving(false);

    if (error) {
      toast({ title: '操作失败', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: editingExam ? '更新成功' : '创建成功' });
      setDialogOpen(false);
      fetchData();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个考试吗？')) return;

    const { error } = await supabase.from('exams').delete().eq('id', id);

    if (error) {
      toast({ title: '删除失败', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: '删除成功' });
      fetchData();
    }
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return '-';
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || '-';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">考试管理</h1>
          <p className="text-muted-foreground">管理具体考试科目</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              添加考试
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingExam ? '编辑考试' : '添加考试'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">考试名称 *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="如：一级建造师"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">URL别名 *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="如：yijian"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category_id">所属分类</Label>
                <Select
                  value={formData.category_id || "none"}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value === "none" ? "" : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">无</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">描述</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="考试简介"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="icon">图标（Emoji）</Label>
                  <Input
                    id="icon"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="如：🏗️"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exam_date">考试日期</Label>
                  <Input
                    id="exam_date"
                    type="date"
                    value={formData.exam_date}
                    onChange={(e) => setFormData({ ...formData, exam_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sort_order">排序</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
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
                    id="is_hot"
                    checked={formData.is_hot}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_hot: checked })}
                  />
                  <Label htmlFor="is_hot">热门</Label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingExam ? '更新' : '创建'}
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
                <TableHead>图标</TableHead>
                <TableHead>名称</TableHead>
                <TableHead>分类</TableHead>
                <TableHead>考试日期</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : exams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                exams.map((exam) => (
                  <TableRow key={exam.id}>
                    <TableCell className="text-2xl">{exam.icon || '📝'}</TableCell>
                    <TableCell>
                      <div>
                        <span className="font-medium">{exam.name}</span>
                        {exam.is_hot && <span className="ml-2 tag-hot">热门</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{getCategoryName(exam.category_id)}</TableCell>
                    <TableCell>{exam.exam_date || '-'}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        exam.is_active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                      }`}>
                        {exam.is_active ? '启用' : '禁用'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(exam)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(exam.id)}
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

export default AdminExams;

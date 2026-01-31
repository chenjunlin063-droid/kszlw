import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  parent_id: string | null;
  sort_order: number | null;
  is_active: boolean | null;
}

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon: '',
    parent_id: '',
    sort_order: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('exam_categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (data) {
      setCategories(data);
    }
    setIsLoading(false);
  };

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        slug: category.slug,
        icon: category.icon || '',
        parent_id: category.parent_id || '',
        sort_order: category.sort_order || 0,
        is_active: category.is_active ?? true,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        slug: '',
        icon: '',
        parent_id: '',
        sort_order: 0,
        is_active: true,
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const categoryData = {
      name: formData.name,
      slug: formData.slug,
      icon: formData.icon || null,
      parent_id: formData.parent_id || null,
      sort_order: formData.sort_order,
      is_active: formData.is_active,
    };

    let error;
    if (editingCategory) {
      const result = await supabase
        .from('exam_categories')
        .update(categoryData)
        .eq('id', editingCategory.id);
      error = result.error;
    } else {
      const result = await supabase
        .from('exam_categories')
        .insert(categoryData);
      error = result.error;
    }

    setIsSaving(false);

    if (error) {
      toast({
        title: '操作失败',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: editingCategory ? '更新成功' : '创建成功',
      });
      setDialogOpen(false);
      fetchCategories();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个分类吗？')) return;

    const { error } = await supabase
      .from('exam_categories')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: '删除失败',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({ title: '删除成功' });
      fetchCategories();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">考试分类</h1>
          <p className="text-muted-foreground">管理考试大类</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              添加分类
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCategory ? '编辑分类' : '添加分类'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">分类名称</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="如：建筑工程"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">URL别名</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="如：jianzhu"
                  required
                />
              </div>
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
                <Label htmlFor="parent_id">父级分类</Label>
                <Select
                  value={formData.parent_id}
                  onValueChange={(value) => setFormData({ ...formData, parent_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择父级分类（可选）" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">无</SelectItem>
                    {categories
                      .filter((c) => c.id !== editingCategory?.id)
                      .map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sort_order">排序</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">启用</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  取消
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingCategory ? '更新' : '创建'}
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
                <TableHead>别名</TableHead>
                <TableHead>排序</TableHead>
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
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="text-2xl">{category.icon || '📁'}</TableCell>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                    <TableCell>{category.sort_order}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        category.is_active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                      }`}>
                        {category.is_active ? '启用' : '禁用'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(category)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(category.id)}
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

export default AdminCategories;

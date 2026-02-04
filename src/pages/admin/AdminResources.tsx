import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Loader2, Upload, FileText } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MarkdownEditor from '@/components/admin/MarkdownEditor';

interface Resource {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string | null;
  vip_content: string | null;
  exam_id: string;
  resource_type: string;
  access_type: string;
  year: number | null;
  subject: string | null;
  file_url: string | null;
  file_size: string | null;
  file_format: string | null;
  preview_image: string | null;
  points_required: number | null;
  download_count: number | null;
  is_hot: boolean | null;
  is_new: boolean | null;
  is_active: boolean | null;
}

interface Exam {
  id: string;
  name: string;
}

const resourceTypes = ['真题', '课件', '押题', '教材', '其他'];
const accessTypes = ['免费', '积分', '兑换码', 'VIP'];

const AdminResources = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    content: '',
    vip_content: '',
    exam_id: '',
    resource_type: '真题',
    access_type: '免费',
    year: new Date().getFullYear(),
    subject: '',
    file_url: '',
    file_size: '',
    file_format: '',
    preview_image: '',
    points_required: 0,
    is_hot: false,
    is_new: true,
    is_active: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [resourcesRes, examsRes] = await Promise.all([
      supabase.from('resources').select('*').order('created_at', { ascending: false }),
      supabase.from('exams').select('id, name').eq('is_active', true),
    ]);

    if (resourcesRes.data) setResources(resourcesRes.data);
    if (examsRes.data) setExams(examsRes.data);
    setIsLoading(false);
  };

  const handleOpenDialog = (resource?: Resource) => {
    if (resource) {
      setEditingResource(resource);
      setFormData({
        title: resource.title,
        slug: resource.slug,
        description: resource.description || '',
        content: resource.content || '',
        vip_content: resource.vip_content || '',
        exam_id: resource.exam_id,
        resource_type: resource.resource_type,
        access_type: resource.access_type,
        year: resource.year || new Date().getFullYear(),
        subject: resource.subject || '',
        file_url: resource.file_url || '',
        file_size: resource.file_size || '',
        file_format: resource.file_format || '',
        preview_image: resource.preview_image || '',
        points_required: resource.points_required || 0,
        is_hot: resource.is_hot ?? false,
        is_new: resource.is_new ?? true,
        is_active: resource.is_active ?? true,
      });
    } else {
      setEditingResource(null);
      setFormData({
        title: '',
        slug: '',
        description: '',
        content: '',
        vip_content: '',
        exam_id: '',
        resource_type: '真题',
        access_type: '免费',
        year: new Date().getFullYear(),
        subject: '',
        file_url: '',
        file_size: '',
        file_format: '',
        preview_image: '',
        points_required: 0,
        is_hot: false,
        is_new: true,
        is_active: true,
      });
    }
    setDialogOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `resources/${fileName}`;

    const { data, error } = await supabase.storage
      .from('resources')
      .upload(filePath, file);

    setIsUploading(false);

    if (error) {
      toast({
        title: '上传失败',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    const { data: urlData } = supabase.storage
      .from('resources')
      .getPublicUrl(filePath);

    const fileSizeStr = file.size < 1024 * 1024
      ? `${(file.size / 1024).toFixed(1)} KB`
      : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

    setFormData({
      ...formData,
      file_url: urlData.publicUrl,
      file_size: fileSizeStr,
      file_format: fileExt?.toUpperCase() || '',
    });

    toast({ title: '文件上传成功' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.exam_id) {
      toast({ title: '请选择所属考试', variant: 'destructive' });
      return;
    }

    setIsSaving(true);

    const resourceData = {
      title: formData.title,
      slug: formData.slug,
      description: formData.description || null,
      content: formData.content || null,
      vip_content: formData.vip_content || null,
      exam_id: formData.exam_id,
      resource_type: formData.resource_type as any,
      access_type: formData.access_type as any,
      year: formData.year || null,
      subject: formData.subject || null,
      file_url: formData.file_url || null,
      file_size: formData.file_size || null,
      file_format: formData.file_format || null,
      preview_image: formData.preview_image || null,
      points_required: formData.points_required,
      is_hot: formData.is_hot,
      is_new: formData.is_new,
      is_active: formData.is_active,
    };

    let error;
    if (editingResource) {
      const result = await supabase.from('resources').update(resourceData).eq('id', editingResource.id);
      error = result.error;
    } else {
      const result = await supabase.from('resources').insert(resourceData);
      error = result.error;
    }

    setIsSaving(false);

    if (error) {
      toast({ title: '操作失败', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: editingResource ? '更新成功' : '创建成功' });
      setDialogOpen(false);
      fetchData();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个资料吗？')) return;

    const { error } = await supabase.from('resources').delete().eq('id', id);

    if (error) {
      toast({ title: '删除失败', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: '删除成功' });
      fetchData();
    }
  };

  const getExamName = (examId: string) => {
    const exam = exams.find((e) => e.id === examId);
    return exam?.name || '-';
  };

  const getAccessTypeStyle = (type: string) => {
    switch (type) {
      case '免费': return 'bg-success/10 text-success';
      case '积分': return 'bg-primary/10 text-primary';
      case 'VIP': return 'bg-accent/10 text-accent';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">资料管理</h1>
          <p className="text-muted-foreground">管理考试资料、上传文件</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              添加资料
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingResource ? '编辑资料' : '添加资料'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">资料标题 *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="如：2024年一级建造师真题"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">URL别名 *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="如：yijian-2024-zhenti"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="exam_id">所属考试 *</Label>
                  <Select
                    value={formData.exam_id}
                    onValueChange={(value) => setFormData({ ...formData, exam_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择考试" />
                    </SelectTrigger>
                    <SelectContent>
                      {exams.map((e) => (
                        <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">科目</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="如：建设工程经济"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>资料类型</Label>
                  <Select
                    value={formData.resource_type}
                    onValueChange={(value) => setFormData({ ...formData, resource_type: value })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {resourceTypes.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>获取方式</Label>
                  <Select
                    value={formData.access_type}
                    onValueChange={(value) => setFormData({ ...formData, access_type: value })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {accessTypes.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">年份</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              {formData.access_type === '积分' && (
                <div className="space-y-2">
                  <Label htmlFor="points_required">所需积分</Label>
                  <Input
                    id="points_required"
                    type="number"
                    value={formData.points_required}
                    onChange={(e) => setFormData({ ...formData, points_required: parseInt(e.target.value) || 0 })}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="description">简介</Label>
                <MarkdownEditor
                  value={formData.description}
                  onChange={(val) => setFormData({ ...formData, description: val })}
                  placeholder="资料简介"
                  minRows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">详细内容</Label>
                <MarkdownEditor
                  value={formData.content}
                  onChange={(val) => setFormData({ ...formData, content: val })}
                  placeholder="资料详细介绍（支持Markdown语法，可直接粘贴图片）"
                  minRows={6}
                />
              </div>

              {/* VIP Content */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="vip_content" className="text-amber-600 dark:text-amber-400">
                    VIP专属内容
                  </Label>
                  <span className="text-xs px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full">
                    仅VIP可见
                  </span>
                </div>
                <MarkdownEditor
                  value={formData.vip_content}
                  onChange={(val) => setFormData({ ...formData, vip_content: val })}
                  placeholder="VIP专属内容，如下载链接、提取码等（仅VIP会员可见）"
                  minRows={4}
                />
                <p className="text-xs text-muted-foreground">
                  在这里添加VIP专属内容，如资源下载链接、网盘提取码等。非VIP用户将看到锁定状态。
                </p>
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <Label>文件上传</Label>
                <div className="border-2 border-dashed rounded-lg p-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar"
                    onChange={handleFileUpload}
                  />
                  {formData.file_url ? (
                    <div className="flex items-center gap-3">
                      <FileText className="w-10 h-10 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium">{formData.file_format} 文件</p>
                        <p className="text-sm text-muted-foreground">{formData.file_size}</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        更换文件
                      </Button>
                    </div>
                  ) : (
                    <div
                      className="text-center cursor-pointer py-4"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {isUploading ? (
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                      ) : (
                        <>
                          <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">
                            点击上传文件（PDF、Word、Excel、PPT、ZIP等）
                          </p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="preview_image">预览图URL（可选）</Label>
                <Input
                  id="preview_image"
                  value={formData.preview_image}
                  onChange={(e) => setFormData({ ...formData, preview_image: e.target.value })}
                  placeholder="资料封面图片URL"
                />
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
                    id="is_new"
                    checked={formData.is_new}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_new: checked })}
                  />
                  <Label htmlFor="is_new">新品</Label>
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
                  {editingResource ? '更新' : '创建'}
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
                <TableHead>考试</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>获取方式</TableHead>
                <TableHead>下载量</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : resources.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                resources.map((resource) => (
                  <TableRow key={resource.id}>
                    <TableCell>
                      <div className="max-w-xs">
                        <span className="font-medium line-clamp-1">{resource.title}</span>
                        <div className="flex items-center gap-1 mt-1">
                          {resource.is_hot && <span className="tag-hot">热</span>}
                          {resource.is_new && <span className="tag-new">新</span>}
                          {resource.year && <span className="text-xs text-muted-foreground">{resource.year}</span>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{getExamName(resource.exam_id)}</TableCell>
                    <TableCell>{resource.resource_type}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getAccessTypeStyle(resource.access_type)}`}>
                        {resource.access_type}
                      </span>
                    </TableCell>
                    <TableCell>{resource.download_count || 0}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        resource.is_active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                      }`}>
                        {resource.is_active ? '启用' : '禁用'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(resource)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(resource.id)}
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

export default AdminResources;

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderTree, GraduationCap, FileText, Users, Download, TrendingUp } from 'lucide-react';

interface DashboardStats {
  categories: number;
  exams: number;
  resources: number;
  downloads: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    categories: 0,
    exams: 0,
    resources: 0,
    downloads: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const [categoriesRes, examsRes, resourcesRes, downloadsRes] = await Promise.all([
      supabase.from('exam_categories').select('id', { count: 'exact', head: true }),
      supabase.from('exams').select('id', { count: 'exact', head: true }),
      supabase.from('resources').select('id', { count: 'exact', head: true }),
      supabase.from('download_history').select('id', { count: 'exact', head: true }),
    ]);

    setStats({
      categories: categoriesRes.count || 0,
      exams: examsRes.count || 0,
      resources: resourcesRes.count || 0,
      downloads: downloadsRes.count || 0,
    });
    setIsLoading(false);
  };

  const statCards = [
    { label: '考试分类', value: stats.categories, icon: FolderTree, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: '考试科目', value: stats.exams, icon: GraduationCap, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: '资料总数', value: stats.resources, icon: FileText, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: '下载总量', value: stats.downloads, icon: Download, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">仪表盘</h1>
        <p className="text-muted-foreground">欢迎使用管理后台</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${stat.bg} rounded-full flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">
                      {isLoading ? '...' : stat.value.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              快速操作
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <a href="/admin/categories" className="p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors text-center">
                <FolderTree className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="font-medium">添加分类</p>
              </a>
              <a href="/admin/exams" className="p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors text-center">
                <GraduationCap className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="font-medium">添加考试</p>
              </a>
              <a href="/admin/resources" className="p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors text-center">
                <FileText className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="font-medium">上传资料</p>
              </a>
              <a href="/admin/announcements" className="p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="font-medium">发布公告</p>
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>使用说明</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>1. <strong>考试分类</strong>：创建考试大类（如建筑工程、财经会计）</p>
            <p>2. <strong>考试管理</strong>：在分类下添加具体考试（如一级建造师）</p>
            <p>3. <strong>资料管理</strong>：上传真题、课件等资料，设置获取方式</p>
            <p>4. <strong>公告管理</strong>：发布网站公告和优惠信息</p>
            <p>5. <strong>网站设置</strong>：配置网站基本信息和功能选项</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;

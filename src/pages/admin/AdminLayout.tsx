import { useEffect } from 'react';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Loader2, LayoutDashboard, FolderTree, GraduationCap, FileText, Megaphone, Settings, ArrowLeft, BookOpen, Crown, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';

const adminNavItems = [
  { label: '仪表盘', href: '/admin', icon: LayoutDashboard },
  { label: '考试分类', href: '/admin/categories', icon: FolderTree },
  { label: '考试管理', href: '/admin/exams', icon: GraduationCap },
  { label: '资料管理', href: '/admin/resources', icon: FileText },
  { label: '公告管理', href: '/admin/announcements', icon: Megaphone },
  { label: '网站设置', href: '/admin/settings', icon: Settings },
  { label: 'VIP订单', href: '/admin/vip-orders', icon: Crown },
   { label: '邀请码', href: '/admin/invitation-codes', icon: Gift },
];

const AdminLayout = () => {
  const { user, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      navigate('/auth');
    }
  }, [user, isAdmin, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Admin Header */}
      <header className="bg-foreground text-background h-16 sticky top-0 z-50">
        <div className="h-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold">考试资料网</span>
            </Link>
            <span className="text-background/60">|</span>
            <span className="text-sm text-background/80">管理后台</span>
          </div>
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-background hover:text-background hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回前台
            </Button>
          </Link>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-card border-r border-border min-h-[calc(100vh-4rem)] sticky top-16">
          <nav className="p-4 space-y-1">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

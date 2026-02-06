import { useEffect, useState } from 'react';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Loader2, LayoutDashboard, FolderTree, GraduationCap, FileText, Megaphone, Settings, ArrowLeft, BookOpen, Crown, Gift, Menu, X } from 'lucide-react';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      navigate('/auth');
    }
  }, [user, isAdmin, isLoading, navigate]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

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
      <header className="bg-foreground text-background h-14 md:h-16 sticky top-0 z-50">
        <div className="h-full px-3 md:px-4 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            {/* Mobile hamburger */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-background hover:bg-white/10 h-8 w-8"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <Link to="/" className="flex items-center gap-2">
              <div className="w-7 h-7 md:w-8 md:h-8 bg-primary rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-sm md:text-base">管理后台</span>
            </Link>
          </div>
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-background hover:text-background hover:bg-white/10 text-xs md:text-sm h-8">
              <ArrowLeft className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">返回前台</span>
              <span className="sm:hidden">返回</span>
            </Button>
          </Link>
        </div>
      </header>

      <div className="flex relative">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={cn(
          "bg-card border-r border-border min-h-[calc(100vh-3.5rem)] md:min-h-[calc(100vh-4rem)]",
          // Mobile: overlay sidebar
          "fixed md:sticky top-14 md:top-16 z-40 w-56 md:w-64 transition-transform duration-200",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}>
          <nav className="p-2 md:p-4 space-y-0.5 md:space-y-1">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-2.5 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-lg text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="w-4 h-4 md:w-5 md:h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-3 md:p-6 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

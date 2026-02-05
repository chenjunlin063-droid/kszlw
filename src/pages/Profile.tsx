import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Mail, Coins, Download, Settings, LogOut, Shield, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { VipStatusCard } from '@/components/profile/VipStatusCard';
import { VipOrderHistory } from '@/components/profile/VipOrderHistory';

interface Profile {
  username: string | null;
  points: number | null;
  avatar_url: string | null;
  is_vip: boolean | null;
  vip_expires_at: string | null;
}

interface DownloadRecord {
  id: string;
  downloaded_at: string;
  resource: {
    title: string;
    slug: string;
  } | null;
}

const Profile = () => {
  const { user, isAdmin, signOut, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [downloads, setDownloads] = useState<DownloadRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchDownloads();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('username, points, avatar_url, is_vip, vip_expires_at')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setProfile(data);
      setUsername(data.username || '');
    }
    setIsLoading(false);
  };

  const fetchDownloads = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('download_history')
      .select(`
        id,
        downloaded_at,
        resource:resources(title, slug)
      `)
      .eq('user_id', user.id)
      .order('downloaded_at', { ascending: false })
      .limit(20);

    if (data) {
      setDownloads(data as unknown as DownloadRecord[]);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ username })
      .eq('user_id', user.id);

    setIsSaving(false);

    if (error) {
      toast({
        title: '更新失败',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: '更新成功',
        description: '个人资料已更新',
      });
      fetchProfile();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    toast({
      title: '已退出登录',
    });
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">个人中心</h1>
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="outline" size="sm">
                    <Shield className="w-4 h-4 mr-2" />
                    管理后台
                  </Button>
                </Link>
              )}
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                退出登录
              </Button>
            </div>
          </div>

          {/* VIP Status */}
          <div className="mb-8">
            <VipStatusCard 
              isVip={profile?.is_vip || false} 
              expiresAt={profile?.vip_expires_at || null} 
            />
          </div>

          {/* User Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">用户名</p>
                    <p className="font-semibold">{profile?.username || '未设置'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                    <Coins className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">我的积分</p>
                    <p className="font-semibold text-lg">{profile?.points || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
                    <Download className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">下载次数</p>
                    <p className="font-semibold">{downloads.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="profile">
            <TabsList>
              <TabsTrigger value="profile">
                <Settings className="w-4 h-4 mr-2" />
                账户设置
              </TabsTrigger>
              <TabsTrigger value="downloads">
                <Download className="w-4 h-4 mr-2" />
                下载记录
              </TabsTrigger>
              <TabsTrigger value="vip-orders">
                <Crown className="w-4 h-4 mr-2" />
                会员订单
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>个人资料</CardTitle>
                  <CardDescription>更新您的个人信息</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">邮箱</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          value={user.email || ''}
                          disabled
                          className="pl-10 bg-muted"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">用户名</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="username"
                          type="text"
                          placeholder="设置您的用户名"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          保存中...
                        </>
                      ) : (
                        '保存修改'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="downloads" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>下载记录</CardTitle>
                  <CardDescription>最近下载的资料</CardDescription>
                </CardHeader>
                <CardContent>
                  {downloads.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      暂无下载记录
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {downloads.map((download) => (
                        <div
                          key={download.id}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">
                              {download.resource?.title || '资料已删除'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(download.downloaded_at).toLocaleString('zh-CN')}
                            </p>
                          </div>
                          {download.resource && (
                            <Link to={`/resource/${download.resource.slug}`}>
                              <Button variant="ghost" size="sm">
                                查看
                              </Button>
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vip-orders" className="mt-6">
              <VipOrderHistory userId={user.id} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;

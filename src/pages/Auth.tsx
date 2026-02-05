import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, User } from 'lucide-react';
 import { Gift } from 'lucide-react';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';

const emailSchema = z.string().email('请输入有效的邮箱地址');
const passwordSchema = z.string().min(6, '密码至少需要6个字符');

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [needsEmailConfirm, setNeedsEmailConfirm] = useState(false);
  const [isResendingConfirm, setIsResendingConfirm] = useState(false);
  
  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
   const [invitationCode, setInvitationCode] = useState('');

  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setNeedsEmailConfirm(false);
    
    try {
      emailSchema.parse(loginEmail);
      passwordSchema.parse(loginPassword);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({
          title: '输入错误',
          description: err.errors[0].message,
          variant: 'destructive',
        });
        return;
      }
    }

    setIsLoading(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setIsLoading(false);

    if (error) {
      let message = '登录失败，请重试';
      if (error.message.includes('Invalid login credentials')) {
        message = '邮箱或密码错误';
      } else if (error.message.includes('Email not confirmed')) {
        message = '请先验证您的邮箱';
        setNeedsEmailConfirm(true);
      }
      toast({
        title: '登录失败',
        description: message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: '登录成功',
        description: '欢迎回来！',
      });
      navigate('/');
    }
  };

  const handleResendConfirmation = async () => {
    try {
      emailSchema.parse(loginEmail);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({
          title: '请输入邮箱',
          description: '请先在邮箱输入框填写有效邮箱地址后再发送验证邮件',
          variant: 'destructive',
        });
        return;
      }
    }

    setIsResendingConfirm(true);
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: loginEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    setIsResendingConfirm(false);

    if (error) {
      toast({
        title: '发送失败',
        description: error.message || '验证邮件发送失败，请稍后重试',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: '已发送验证邮件',
      description: '请前往邮箱点击验证链接，完成后再回来登录（可检查垃圾箱）',
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      emailSchema.parse(registerEmail);
      passwordSchema.parse(registerPassword);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({
          title: '输入错误',
          description: err.errors[0].message,
          variant: 'destructive',
        });
        return;
      }
    }

    if (registerPassword !== confirmPassword) {
      toast({
        title: '密码不匹配',
        description: '两次输入的密码不一致',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
     const { error, data } = await signUp(registerEmail, registerPassword, registerUsername);
    setIsLoading(false);

    if (error) {
      let message = '注册失败，请重试';
      if (error.message.includes('User already registered')) {
        message = '该邮箱已被注册';
      }
      toast({
        title: '注册失败',
        description: message,
        variant: 'destructive',
      });
    } else {
       // If invitation code provided, try to activate VIP
       if (invitationCode.trim() && data?.user) {
         await activateInvitationCode(data.user.id);
       }
      toast({
        title: '注册成功',
        description: '请检查您的邮箱以验证账户（也可能直接登录成功）',
      });
    }
  };

   const activateInvitationCode = async (userId: string) => {
     // Validate invitation code
     const { data: codeData, error: codeError } = await supabase
       .from('invitation_codes')
       .select('*')
       .eq('code', invitationCode.toUpperCase())
       .eq('is_active', true)
       .maybeSingle();

     if (codeError || !codeData) {
       toast({ title: '邀请码无效', description: '邀请码无效，但注册已成功', variant: 'destructive' });
       return;
     }

     // Check if code has remaining uses
     if (codeData.used_count >= codeData.max_uses) {
       toast({ title: '邀请码已用完', description: '邀请码已用完，但注册已成功' });
       return;
     }

     // Check expiration
     if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) {
       toast({ title: '邀请码已过期', description: '邀请码已过期，但注册已成功' });
       return;
     }

     // Create a paid order
     const { error: orderError } = await supabase.from('vip_orders').insert({
       user_id: userId,
       plan_type: codeData.plan_type,
       amount: 0,
       status: 'paid',
       payment_method: 'invitation_code',
       payment_reference: codeData.code,
     });

     if (orderError) {
       console.error('Failed to activate VIP:', orderError);
       return;
     }

     // Update code usage count
     await supabase
       .from('invitation_codes')
       .update({ used_count: codeData.used_count + 1 })
       .eq('id', codeData.id);

     // Record code usage
     await supabase.from('invitation_code_uses').insert({
       code_id: codeData.id,
       user_id: userId,
     });

     toast({
       title: '🎉 VIP会员已激活',
       description: `恭喜！您已通过邀请码获得${codeData.plan_type === 'yearly' ? '年度' : '月度'}会员`,
     });
   };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-12">
        <div className="max-w-md mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">欢迎来到考试资料网</CardTitle>
              <CardDescription>登录或注册以访问更多功能</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">登录</TabsTrigger>
                  <TabsTrigger value="register">注册</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">邮箱</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="请输入邮箱"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">密码</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="请输入密码"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          登录中...
                        </>
                      ) : (
                        '登录'
                      )}
                    </Button>

                    {needsEmailConfirm && (
                      <div className="rounded-md border bg-card p-3 text-sm">
                        <p className="text-foreground">你的邮箱尚未验证。</p>
                        <p className="mt-1 text-muted-foreground">
                          点击下方按钮重新发送验证邮件，然后在邮箱里完成验证。
                        </p>
                        <Button
                          type="button"
                          variant="secondary"
                          className="mt-3 w-full"
                          onClick={handleResendConfirmation}
                          disabled={isResendingConfirm}
                        >
                          {isResendingConfirm ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              发送中...
                            </>
                          ) : (
                            '重新发送验证邮件'
                          )}
                        </Button>
                      </div>
                    )}
                  </form>
                </TabsContent>

                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-username">用户名（可选）</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="register-username"
                          type="text"
                          placeholder="请输入用户名"
                          value={registerUsername}
                          onChange={(e) => setRegisterUsername(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email">邮箱</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="register-email"
                          type="email"
                          placeholder="请输入邮箱"
                          value={registerEmail}
                          onChange={(e) => setRegisterEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">密码</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="register-password"
                          type="password"
                          placeholder="至少6位密码"
                          value={registerPassword}
                          onChange={(e) => setRegisterPassword(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">确认密码</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirm-password"
                          type="password"
                          placeholder="再次输入密码"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          注册中...
                        </>
                      ) : (
                        '注册'
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      🎁 新用户注册即送50积分
                    </p>
                     <div className="space-y-2 pt-2 border-t">
                       <Label htmlFor="invitation-code" className="text-xs text-muted-foreground flex items-center gap-1">
                         <Gift className="w-3 h-3" />
                         邀请码（可选）
                       </Label>
                       <Input
                         id="invitation-code"
                         type="text"
                         placeholder="有邀请码？输入后注册即可获得会员"
                         value={invitationCode}
                         onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
                         className="font-mono tracking-wider"
                       />
                     </div>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;

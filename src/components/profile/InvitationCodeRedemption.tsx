import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Gift, Sparkles } from 'lucide-react';

interface InvitationCodeRedemptionProps {
  userId: string;
  onSuccess: () => void;
}

export const InvitationCodeRedemption = ({ userId, onSuccess }: InvitationCodeRedemptionProps) => {
  const [code, setCode] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const { toast } = useToast();

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      toast({
        title: '请输入邀请码',
        variant: 'destructive',
      });
      return;
    }

    setIsRedeeming(true);

    try {
      // Validate invitation code
      const { data: invitationCode, error: codeError } = await supabase
        .from('invitation_codes')
        .select('*')
        .eq('code', code.trim().toUpperCase())
        .eq('is_active', true)
        .maybeSingle();

      if (codeError || !invitationCode) {
        toast({
          title: '邀请码无效',
          description: '请检查邀请码是否正确',
          variant: 'destructive',
        });
        setIsRedeeming(false);
        return;
      }

      // Check if code has expired
      if (invitationCode.expires_at && new Date(invitationCode.expires_at) < new Date()) {
        toast({
          title: '邀请码已过期',
          variant: 'destructive',
        });
        setIsRedeeming(false);
        return;
      }

      // Check if code has been used up
      if (invitationCode.used_count >= invitationCode.max_uses) {
        toast({
          title: '邀请码已用完',
          variant: 'destructive',
        });
        setIsRedeeming(false);
        return;
      }

      // Check if user already used this code
      const { data: existingUse } = await supabase
        .from('invitation_code_uses')
        .select('id')
        .eq('code_id', invitationCode.id)
        .eq('user_id', userId)
        .maybeSingle();

      if (existingUse) {
        toast({
          title: '您已使用过此邀请码',
          variant: 'destructive',
        });
        setIsRedeeming(false);
        return;
      }

      // Calculate VIP expiry date
      const duration = invitationCode.plan_type === 'yearly' ? 365 : 30;
      
      // Get current VIP status
      const { data: profile } = await supabase
        .from('profiles')
        .select('vip_expires_at')
        .eq('user_id', userId)
        .maybeSingle();

      let newExpiry: Date;
      if (profile?.vip_expires_at && new Date(profile.vip_expires_at) > new Date()) {
        // Extend from current expiry
        newExpiry = new Date(profile.vip_expires_at);
        newExpiry.setDate(newExpiry.getDate() + duration);
      } else {
        // Start from now
        newExpiry = new Date();
        newExpiry.setDate(newExpiry.getDate() + duration);
      }

      // Update profile with VIP status
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          is_vip: true,
          vip_expires_at: newExpiry.toISOString(),
        })
        .eq('user_id', userId);

      if (profileError) throw profileError;

      // Record code usage
      const { error: useError } = await supabase
        .from('invitation_code_uses')
        .insert({
          code_id: invitationCode.id,
          user_id: userId,
        });

      if (useError) throw useError;

      // Update code usage count
      await supabase
        .from('invitation_codes')
        .update({ used_count: invitationCode.used_count + 1 })
        .eq('id', invitationCode.id);

      toast({
        title: '🎉 兑换成功！',
        description: `您已成功开通${invitationCode.plan_type === 'yearly' ? '年度' : '月度'}VIP会员`,
      });

      setCode('');
      onSuccess();
    } catch (error: any) {
      toast({
        title: '兑换失败',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <Card className="border-accent/30 bg-gradient-to-br from-accent/5 to-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-accent" />
          邀请码兑换
        </CardTitle>
        <CardDescription>
          输入邀请码可免费激活VIP会员资格
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRedeem} className="space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="请输入邀请码"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="pl-10 uppercase tracking-wider font-mono"
                disabled={isRedeeming}
              />
            </div>
            <Button 
              type="submit" 
              disabled={isRedeeming || !code.trim()}
              className="bg-gradient-accent hover:opacity-90"
            >
              {isRedeeming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  兑换中...
                </>
              ) : (
                '立即兑换'
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            邀请码不区分大小写，兑换后VIP权益立即生效
          </p>
        </form>
      </CardContent>
    </Card>
  );
};

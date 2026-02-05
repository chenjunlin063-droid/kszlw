import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';

interface SiteSetting {
  id: string;
  key: string;
  value: any;
  description: string | null;
}

const defaultSettings = {
  site_name: '考试资料网',
  site_description: '专业备考资料分享平台，汇集全网最新考试真题、精品课件、押题密卷',
  contact_email: 'contact@kaoshiziliao.com',
  contact_phone: '400-888-8888',
  icp_number: '',
  vip_price_monthly: 29,
  vip_price_yearly: 199,
  points_per_signup: 50,
  footer_text: '© 2024 考试资料网. All rights reserved.',
  wechat_qr_code: '',
  alipay_qr_code: '',
  customer_service_wechat: '',
  customer_service_phone: '400-888-8888',
  customer_service_qr_code: '',
  card_key_purchase_link: '',
};

const AdminSettings = () => {
  const [settings, setSettings] = useState<Record<string, any>>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*');

    if (data) {
      const settingsMap = { ...defaultSettings };
      data.forEach((setting) => {
        settingsMap[setting.key] = setting.value;
      });
      setSettings(settingsMap);
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);

    // Upsert all settings
    const settingsToSave = Object.entries(settings).map(([key, value]) => ({
      key,
      value,
      description: getSettingDescription(key),
    }));

    for (const setting of settingsToSave) {
      const { error } = await supabase
        .from('site_settings')
        .upsert(
          { key: setting.key, value: setting.value, description: setting.description },
          { onConflict: 'key' }
        );

      if (error) {
        toast({ title: '保存失败', description: error.message, variant: 'destructive' });
        setIsSaving(false);
        return;
      }
    }

    setIsSaving(false);
    toast({ title: '保存成功' });
  };

  const getSettingDescription = (key: string): string => {
    const descriptions: Record<string, string> = {
      site_name: '网站名称',
      site_description: '网站描述',
      contact_email: '联系邮箱',
      contact_phone: '联系电话',
      icp_number: 'ICP备案号',
      vip_price_monthly: 'VIP月费价格',
      vip_price_yearly: 'VIP年费价格',
      points_per_signup: '注册赠送积分',
      footer_text: '页脚版权文字',
      wechat_qr_code: '微信支付二维码URL',
      alipay_qr_code: '支付宝支付二维码URL',
      customer_service_wechat: '客服微信号',
      customer_service_phone: '客服电话',
      customer_service_qr_code: '客服微信二维码URL',
      card_key_purchase_link: '卡密购买链接',
    };
    return descriptions[key] || key;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">网站设置</h1>
          <p className="text-muted-foreground">配置网站基本信息和功能选项</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          保存设置
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
            <CardDescription>网站名称、描述等基本设置</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="site_name">网站名称</Label>
                <Input
                  id="site_name"
                  value={settings.site_name}
                  onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="icp_number">ICP备案号</Label>
                <Input
                  id="icp_number"
                  value={settings.icp_number}
                  onChange={(e) => setSettings({ ...settings, icp_number: e.target.value })}
                  placeholder="京ICP备XXXXXXXX号"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="site_description">网站描述</Label>
              <Textarea
                id="site_description"
                value={settings.site_description}
                onChange={(e) => setSettings({ ...settings, site_description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="footer_text">页脚版权文字</Label>
              <Input
                id="footer_text"
                value={settings.footer_text}
                onChange={(e) => setSettings({ ...settings, footer_text: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle>联系方式</CardTitle>
            <CardDescription>设置网站联系信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_email">联系邮箱</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={settings.contact_email}
                  onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_phone">联系电话</Label>
                <Input
                  id="contact_phone"
                  value={settings.contact_phone}
                  onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>价格与积分</CardTitle>
            <CardDescription>设置VIP价格和积分规则</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vip_price_monthly">VIP月费（元）</Label>
                <Input
                  id="vip_price_monthly"
                  type="number"
                  value={settings.vip_price_monthly}
                  onChange={(e) => setSettings({ ...settings, vip_price_monthly: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vip_price_yearly">VIP年费（元）</Label>
                <Input
                  id="vip_price_yearly"
                  type="number"
                  value={settings.vip_price_yearly}
                  onChange={(e) => setSettings({ ...settings, vip_price_yearly: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="points_per_signup">注册赠送积分</Label>
                <Input
                  id="points_per_signup"
                  type="number"
                  value={settings.points_per_signup}
                  onChange={(e) => setSettings({ ...settings, points_per_signup: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment QR Codes */}
        <Card>
          <CardHeader>
            <CardTitle>支付设置</CardTitle>
            <CardDescription>配置微信/支付宝收款二维码及卡密购买链接</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="wechat_qr_code">微信支付二维码URL</Label>
                <Input
                  id="wechat_qr_code"
                  value={settings.wechat_qr_code}
                  onChange={(e) => setSettings({ ...settings, wechat_qr_code: e.target.value })}
                  placeholder="https://example.com/wechat-qr.png"
                />
                {settings.wechat_qr_code && (
                  <img src={settings.wechat_qr_code} alt="微信二维码预览" className="w-24 h-24 rounded border mt-2" />
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="alipay_qr_code">支付宝支付二维码URL</Label>
                <Input
                  id="alipay_qr_code"
                  value={settings.alipay_qr_code}
                  onChange={(e) => setSettings({ ...settings, alipay_qr_code: e.target.value })}
                  placeholder="https://example.com/alipay-qr.png"
                />
                {settings.alipay_qr_code && (
                  <img src={settings.alipay_qr_code} alt="支付宝二维码预览" className="w-24 h-24 rounded border mt-2" />
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="card_key_purchase_link">卡密购买链接</Label>
              <Input
                id="card_key_purchase_link"
                value={settings.card_key_purchase_link}
                onChange={(e) => setSettings({ ...settings, card_key_purchase_link: e.target.value })}
                placeholder="https://example.com/buy-card-key"
              />
              <p className="text-xs text-muted-foreground">用户点击"购买卡密"按钮时跳转的链接</p>
            </div>
          </CardContent>
        </Card>

         {/* Customer Service */}
         <Card>
           <CardHeader>
             <CardTitle>客服设置</CardTitle>
             <CardDescription>配置客服联系方式，显示在支付页面</CardDescription>
           </CardHeader>
           <CardContent className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label htmlFor="customer_service_wechat">客服微信号</Label>
                 <Input
                   id="customer_service_wechat"
                   value={settings.customer_service_wechat}
                   onChange={(e) => setSettings({ ...settings, customer_service_wechat: e.target.value })}
                   placeholder="kefu001"
                 />
               </div>
               <div className="space-y-2">
                 <Label htmlFor="customer_service_phone">客服电话</Label>
                 <Input
                   id="customer_service_phone"
                   value={settings.customer_service_phone}
                   onChange={(e) => setSettings({ ...settings, customer_service_phone: e.target.value })}
                   placeholder="400-888-8888"
                 />
               </div>
             </div>
             <div className="space-y-2">
               <Label htmlFor="customer_service_qr_code">客服微信二维码URL</Label>
               <Input
                 id="customer_service_qr_code"
                 value={settings.customer_service_qr_code}
                 onChange={(e) => setSettings({ ...settings, customer_service_qr_code: e.target.value })}
                 placeholder="https://example.com/kefu-qr.png"
               />
               {settings.customer_service_qr_code && (
                 <img src={settings.customer_service_qr_code} alt="客服二维码预览" className="w-24 h-24 rounded border mt-2" />
               )}
             </div>
           </CardContent>
         </Card>
      </div>
    </div>
  );
};

export default AdminSettings;

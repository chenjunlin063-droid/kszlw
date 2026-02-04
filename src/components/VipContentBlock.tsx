import { Lock, Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

interface VipContentBlockProps {
  content: string;
  isVip: boolean;
  isLoggedIn: boolean;
}

const VipContentBlock = ({ content, isVip, isLoggedIn }: VipContentBlockProps) => {
  const navigate = useNavigate();

  // Render markdown content for VIP users
  const renderMarkdown = (markdown: string): string => {
    let html = markdown;
    
    // Escape HTML
    html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    // Code blocks
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="bg-muted p-4 rounded-lg overflow-x-auto my-4"><code>$2</code></pre>');
    
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm">$1</code>');
    
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-6 mb-4">$1</h1>');
    
    // Bold and italic
    html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/~~(.*?)~~/g, '<del>$1</del>');
    
    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-4" />');
    
    // Links - standard markdown links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary/80">$1</a>');
    
    // Auto-detect bare URLs (not already in links)
    html = html.replace(/(?<!href="|">)(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary/80">$1</a>');
    
    // Blockquotes
    html = html.replace(/^&gt; (.*$)/gim, '<blockquote class="border-l-4 border-primary/30 pl-4 italic my-4 text-muted-foreground">$1</blockquote>');
    
    // Unordered lists
    html = html.replace(/^\* (.*$)/gim, '<li class="ml-4">$1</li>');
    html = html.replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>');
    
    // Ordered lists
    html = html.replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal">$1</li>');
    
    // Horizontal rule
    html = html.replace(/^---$/gim, '<hr class="my-6 border-border" />');
    
    // Paragraphs
    html = html.replace(/\n\n/g, '</p><p class="my-3">');
    html = '<p class="my-3">' + html + '</p>';
    
    // Line breaks
    html = html.replace(/\n/g, '<br />');
    
    return html;
  };

  // If user is VIP, show the content
  if (isVip && content) {
    return (
      <Card className="border-2 border-amber-500/30 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Crown className="w-5 h-5 text-amber-500" />
            <span className="font-semibold text-amber-700 dark:text-amber-400">VIP专属内容</span>
          </div>
          <div 
            className="prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
          />
        </CardContent>
      </Card>
    );
  }

  // Show locked state for non-VIP users
  return (
    <Card className="border-2 border-dashed border-amber-500/50 bg-gradient-to-br from-amber-50/30 to-orange-50/30 dark:from-amber-950/10 dark:to-orange-950/10">
      <CardContent className="p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Lock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            </div>
            <Sparkles className="w-5 h-5 text-amber-500 absolute -top-1 -right-1" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-amber-700 dark:text-amber-400">
              VIP专属内容
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              此部分包含VIP会员专属的资源下载链接和详细资料，成为VIP会员即可解锁全部内容
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            {!isLoggedIn ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/auth')}
                >
                  登录账号
                </Button>
                <Button 
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                  onClick={() => navigate('/auth')}
                >
                  <Crown className="w-4 h-4 mr-2" />
                  注册成为VIP
                </Button>
              </>
            ) : (
              <Button 
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                onClick={() => navigate('/profile')}
              >
                <Crown className="w-4 h-4 mr-2" />
                升级VIP会员
              </Button>
            )}
          </div>

          <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Crown className="w-3 h-3" />
              解锁全部资源
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              专属下载链接
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VipContentBlock;

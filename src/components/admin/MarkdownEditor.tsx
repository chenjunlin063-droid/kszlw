import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link,
  Image,
  Table,
  Minus,
  Eye,
  Loader2,
  CheckSquare,
} from 'lucide-react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minRows?: number;
}

const MarkdownEditor = ({ value, onChange, placeholder, minRows = 8 }: MarkdownEditorProps) => {
  const [activeTab, setActiveTab] = useState<string>('write');
  const [isUploading, setIsUploading] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const insertText = useCallback((before: string, after: string = '', placeholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || placeholder;
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    
    onChange(newText);
    
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [value, onChange]);

  const insertAtCursor = useCallback((text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const newText = value.substring(0, start) + text + value.substring(start);
    onChange(newText);
    
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + text.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [value, onChange]);

  const handleBold = () => insertText('**', '**', '粗体文本');
  const handleItalic = () => insertText('*', '*', '斜体文本');
  const handleStrikethrough = () => insertText('~~', '~~', '删除线文本');
  const handleH1 = () => insertText('# ', '', '一级标题');
  const handleH2 = () => insertText('## ', '', '二级标题');
  const handleH3 = () => insertText('### ', '', '三级标题');
  const handleList = () => insertText('- ', '', '列表项');
  const handleOrderedList = () => insertText('1. ', '', '列表项');
  const handleQuote = () => insertText('> ', '', '引用文本');
  const handleCode = () => insertText('`', '`', 'code');
  const handleCodeBlock = () => insertText('```\n', '\n```', '代码块');
  const handleHr = () => insertAtCursor('\n---\n');
  const handleCheckbox = () => insertText('- [ ] ', '', '待办事项');
  const handleTable = () => {
    const table = `
| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 内容 | 内容 | 内容 |
`;
    insertAtCursor(table);
  };

  const handleInsertLink = () => {
    if (linkUrl) {
      const text = linkText || linkUrl;
      insertAtCursor(`[${text}](${linkUrl})`);
      setLinkUrl('');
      setLinkText('');
    }
  };

  const handleInsertImage = () => {
    if (imageUrl) {
      const alt = imageAlt || '图片';
      insertAtCursor(`![${alt}](${imageUrl})`);
      setImageUrl('');
      setImageAlt('');
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `content-images/${fileName}`;

    const { error } = await supabase.storage
      .from('resources')
      .upload(filePath, file);

    if (error) {
      toast({
        title: '图片上传失败',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('resources')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  const isValidUrl = (text: string): boolean => {
    try {
      const url = new URL(text.trim());
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    // Check for images first
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (!file) continue;

        setIsUploading(true);
        const url = await uploadImage(file);
        setIsUploading(false);

        if (url) {
          insertAtCursor(`![粘贴的图片](${url})`);
          toast({ title: '图片上传成功' });
        }
        return;
      }
    }

    // Check for plain text URLs
    const text = e.clipboardData.getData('text/plain');
    if (text && isValidUrl(text)) {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = value.substring(start, end);
        
        if (selectedText) {
          // If text is selected, wrap it as link text
          const newText = value.substring(0, start) + `[${selectedText}](${text.trim()})` + value.substring(end);
          onChange(newText);
          toast({ title: '已自动识别链接', description: '选中文字已转换为超链接' });
        } else {
          // Insert as auto-linked URL
          insertAtCursor(text.trim());
          toast({ title: '已自动识别链接' });
        }
      }
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer?.files;
    if (!files?.length) return;

    for (const file of files) {
      if (file.type.startsWith('image/')) {
        setIsUploading(true);
        const url = await uploadImage(file);
        setIsUploading(false);

        if (url) {
          insertAtCursor(`![${file.name}](${url})`);
          toast({ title: '图片上传成功' });
        }
      }
    }
  };

  const renderMarkdown = (text: string) => {
    let html = text
      // Code blocks (must be before inline code)
      .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
      // Headers
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold mt-5 mb-2">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-6 mb-3">$1</h1>')
      // Bold
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Strikethrough
      .replace(/~~(.+?)~~/g, '<del>$1</del>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline hover:text-primary/80" target="_blank" rel="noopener noreferrer">$1</a>')
      // Auto-link URLs
      .replace(/(?<!\()(?<!")(https?:\/\/[^\s<]+)(?!\))/g, '<a href="$1" class="text-primary underline hover:text-primary/80" target="_blank" rel="noopener noreferrer">$1</a>')
      // Images
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full rounded-lg my-2" />')
      // Horizontal rule
      .replace(/^---$/gm, '<hr class="my-4 border-border" />')
      // Blockquote
      .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-primary/30 pl-4 py-1 my-2 text-muted-foreground italic">$1</blockquote>')
      // Checkbox
      .replace(/^- \[x\] (.+)$/gm, '<div class="flex items-center gap-2 my-1"><input type="checkbox" checked disabled class="rounded" /><span class="line-through text-muted-foreground">$1</span></div>')
      .replace(/^- \[ \] (.+)$/gm, '<div class="flex items-center gap-2 my-1"><input type="checkbox" disabled class="rounded" /><span>$1</span></div>')
      // Unordered list
      .replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>')
      // Ordered list
      .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
      // Line breaks
      .replace(/\n/g, '<br />');

    return html;
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between border-b bg-muted/30 px-2">
          <div className="flex items-center gap-0.5 py-1 flex-wrap">
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={handleBold} title="粗体">
              <Bold className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={handleItalic} title="斜体">
              <Italic className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={handleStrikethrough} title="删除线">
              <Strikethrough className="h-4 w-4" />
            </Button>
            <div className="w-px h-5 bg-border mx-1" />
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={handleH1} title="一级标题">
              <Heading1 className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={handleH2} title="二级标题">
              <Heading2 className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={handleH3} title="三级标题">
              <Heading3 className="h-4 w-4" />
            </Button>
            <div className="w-px h-5 bg-border mx-1" />
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={handleList} title="无序列表">
              <List className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={handleOrderedList} title="有序列表">
              <ListOrdered className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={handleCheckbox} title="待办事项">
              <CheckSquare className="h-4 w-4" />
            </Button>
            <div className="w-px h-5 bg-border mx-1" />
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={handleQuote} title="引用">
              <Quote className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={handleCode} title="行内代码">
              <Code className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={handleCodeBlock} title="代码块">
              <span className="text-xs font-mono">{'{}'}</span>
            </Button>
            <div className="w-px h-5 bg-border mx-1" />
            <Popover>
              <PopoverTrigger asChild>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" title="插入链接">
                  <Link className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-3">
                  <h4 className="font-medium">插入链接</h4>
                  <div className="space-y-2">
                    <Label htmlFor="link-text">链接文本</Label>
                    <Input
                      id="link-text"
                      value={linkText}
                      onChange={(e) => setLinkText(e.target.value)}
                      placeholder="显示的文字"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="link-url">链接地址</Label>
                    <Input
                      id="link-url"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  <Button type="button" size="sm" onClick={handleInsertLink} disabled={!linkUrl}>
                    插入
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" title="插入图片">
                  <Image className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-3">
                  <h4 className="font-medium">插入图片</h4>
                  <div className="space-y-2">
                    <Label htmlFor="image-alt">图片描述</Label>
                    <Input
                      id="image-alt"
                      value={imageAlt}
                      onChange={(e) => setImageAlt(e.target.value)}
                      placeholder="图片的描述文字"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image-url">图片地址</Label>
                    <Input
                      id="image-url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    💡 提示：也可以直接粘贴或拖放图片到编辑器
                  </p>
                  <Button type="button" size="sm" onClick={handleInsertImage} disabled={!imageUrl}>
                    插入
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={handleTable} title="表格">
              <Table className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={handleHr} title="分隔线">
              <Minus className="h-4 w-4" />
            </Button>
          </div>
          <TabsList className="h-8">
            <TabsTrigger value="write" className="text-xs h-7 px-3">编辑</TabsTrigger>
            <TabsTrigger value="preview" className="text-xs h-7 px-3">
              <Eye className="h-3 w-3 mr-1" />
              预览
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="write" className="m-0 relative">
          {isUploading && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span>上传中...</span>
              </div>
            </div>
          )}
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onPaste={handlePaste}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            placeholder={placeholder || '支持 Markdown 语法，可直接粘贴图片...'}
            className="border-0 rounded-none focus-visible:ring-0 resize-none"
            style={{ minHeight: `${minRows * 1.5}rem` }}
          />
        </TabsContent>

        <TabsContent value="preview" className="m-0">
          <div
            className="p-4 prose prose-sm max-w-none min-h-[12rem] text-foreground"
            style={{ minHeight: `${minRows * 1.5}rem` }}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(value) || '<p class="text-muted-foreground">暂无内容</p>' }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarkdownEditor;

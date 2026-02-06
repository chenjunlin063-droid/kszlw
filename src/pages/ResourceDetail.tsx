import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useParams, Link } from "react-router-dom";
import { 
  ChevronRight, 
  Download, 
  FileText, 
  Calendar, 
  Eye, 
  Share2,
  BookOpen,
  Clock,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ResourceCard } from "@/components/ResourceCard";
import { supabase } from "@/integrations/supabase/client";
import VipContentBlock from "@/components/VipContentBlock";
import { useAuth } from "@/hooks/useAuth";

interface Resource {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string | null;
  vip_content: string | null;
  resource_type: string;
  access_type: string;
  year: number | null;
  download_count: number | null;
  file_size: string | null;
  file_format: string | null;
  file_url: string | null;
  is_hot: boolean | null;
  is_new: boolean | null;
  points_required: number | null;
  subject: string | null;
  created_at: string;
  updated_at: string;
  exam_id: string;
  exam?: {
    id: string;
    name: string;
    slug: string;
  };
}

interface UserProfile {
  is_vip: boolean | null;
  vip_expires_at: string | null;
}

const ResourceDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [resource, setResource] = useState<Resource | null>(null);
  const [relatedResources, setRelatedResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewCount, setViewCount] = useState(0);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (slug) {
      fetchResource();
    }
  }, [slug]);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    } else {
      setUserProfile(null);
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('is_vip, vip_expires_at')
      .eq('user_id', user.id)
      .single();
    
    setUserProfile(data);
  };

  // Check if user has active VIP status
  const isUserVip = (): boolean => {
    if (!userProfile?.is_vip) return false;
    if (!userProfile.vip_expires_at) return userProfile.is_vip;
    return new Date(userProfile.vip_expires_at) > new Date();
  };

  const fetchResource = async () => {
    setIsLoading(true);
    try {
      // Fetch resource with exam info
      const { data: resourceData, error } = await supabase
        .from('resources')
        .select(`
          *,
          exam:exams(id, name, slug)
        `)
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching resource:', error);
        return;
      }

      setResource(resourceData);
      // Simulate view count (in a real app, this would be tracked in the database)
      setViewCount((resourceData.download_count || 0) * 4);

      // Fetch related resources from the same exam
      if (resourceData.exam_id) {
        const { data: relatedData } = await supabase
          .from('resources')
          .select(`
            *,
            exam:exams(id, name, slug)
          `)
          .eq('exam_id', resourceData.exam_id)
          .eq('is_active', true)
          .neq('id', resourceData.id)
          .limit(3);

        setRelatedResources(relatedData || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Markdown renderer for content display
  const renderMarkdown = (text: string): string => {
    return text
      // Code blocks (must be before inline code)
      .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="bg-muted p-3 rounded-lg overflow-x-auto my-3"><code class="text-sm">$2</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
      // Headers
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-4 mb-2 text-foreground">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold mt-5 mb-2 text-foreground">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-6 mb-3 text-foreground">$1</h1>')
      // Bold
      .replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground">$1</strong>')
      // Italic
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Strikethrough
      .replace(/~~(.+?)~~/g, '<del>$1</del>')
      // Images (must be before links)
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full rounded-lg my-3" />')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline hover:text-primary/80" target="_blank" rel="noopener noreferrer">$1</a>')
      // Auto-link bare URLs (not already in markdown link or image syntax)
      .replace(/(?<!\]\()(?<!")(https?:\/\/[^\s<>\)]+)(?!\))/g, '<a href="$1" class="text-primary underline hover:text-primary/80" target="_blank" rel="noopener noreferrer">$1</a>')
      // Horizontal rule
      .replace(/^---$/gm, '<hr class="my-4 border-border" />')
      // Blockquote
      .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-primary/30 pl-4 py-1 my-2 italic">$1</blockquote>')
      // Checkbox
      .replace(/^- \[x\] (.+)$/gm, '<div class="flex items-center gap-2 my-1"><input type="checkbox" checked disabled class="rounded" /><span class="line-through">$1</span></div>')
      .replace(/^- \[ \] (.+)$/gm, '<div class="flex items-center gap-2 my-1"><input type="checkbox" disabled class="rounded" /><span>$1</span></div>')
      // Unordered list
      .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
      // Ordered list
      .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
      // Line breaks
      .replace(/\n/g, '<br />');
  };

  const getAccessTypeClass = (type: string) => {
    switch (type) {
      case "免费":
        return "tag-free";
      case "VIP":
        return "tag-vip";
      case "积分":
        return "bg-warning text-warning-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">资料不存在</h1>
          <p className="text-muted-foreground mb-6">未找到对应的资料信息</p>
          <Link to="/">
            <Button>返回首页</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-muted/50 border-b border-border">
        <div className="container py-3">
          <nav className="flex items-center gap-2 text-sm flex-wrap">
            <Link to="/" className="text-muted-foreground hover:text-primary">首页</Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            {resource.exam && (
              <>
                <Link to={`/exam/${resource.exam.slug}`} className="text-muted-foreground hover:text-primary">
                  {resource.exam.name}
                </Link>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </>
            )}
            <span className="text-foreground font-medium line-clamp-1">{resource.title}</span>
          </nav>
        </div>
      </div>

      <div className="container py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Title Section */}
            <Card className="mb-4 md:mb-6">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-lg flex items-center justify-center text-primary flex-shrink-0">
                    <FileText className="w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      {resource.is_new && <span className="tag-new">新</span>}
                      {resource.is_hot && <span className="tag-hot">热</span>}
                      <span className={getAccessTypeClass(resource.access_type)}>
                        {resource.access_type}
                      </span>
                    </div>
                    <h1 className="text-lg md:text-2xl font-bold text-foreground mb-2 md:mb-3">
                      {resource.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground">
                      {resource.exam && (
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          {resource.exam.name}
                        </span>
                      )}
                      <Badge variant="outline" className="text-[10px] md:text-xs">{resource.resource_type}</Badge>
                      {resource.year && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          {resource.year}年
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <Separator className="my-4 md:my-6" />

                <div className="grid grid-cols-4 gap-2 md:gap-4 text-center">
                  <div>
                    <div className="text-base md:text-2xl font-bold text-foreground">{(resource.download_count || 0).toLocaleString()}</div>
                    <div className="text-[10px] md:text-sm text-muted-foreground">下载</div>
                  </div>
                  <div>
                    <div className="text-base md:text-2xl font-bold text-foreground">{viewCount.toLocaleString()}</div>
                    <div className="text-[10px] md:text-sm text-muted-foreground">浏览</div>
                  </div>
                  <div>
                    <div className="text-base md:text-2xl font-bold text-foreground">{resource.file_size || "-"}</div>
                    <div className="text-[10px] md:text-sm text-muted-foreground">大小</div>
                  </div>
                  <div>
                    <div className="text-base md:text-2xl font-bold text-foreground">{resource.file_format || "-"}</div>
                    <div className="text-[10px] md:text-sm text-muted-foreground">格式</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            {resource.description && (
              <Card className="mb-4 md:mb-6">
                <CardContent className="p-4 md:p-6">
                  <h2 className="text-base md:text-lg font-bold text-foreground mb-3 md:mb-4">资料简介</h2>
                  <div 
                    className="text-sm md:text-base text-muted-foreground leading-relaxed [&_a]:text-primary [&_a]:underline [&_a]:hover:text-primary/80"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(resource.description) }} 
                  />
                </CardContent>
              </Card>
            )}

            {/* Content */}
            {resource.content && (
              <Card className="mb-4 md:mb-6">
                <CardContent className="p-4 md:p-6">
                  <h2 className="text-base md:text-lg font-bold text-foreground mb-3 md:mb-4">详细内容</h2>
                  <div 
                    className="prose prose-sm max-w-none text-muted-foreground [&_a]:text-primary [&_a]:underline [&_a]:hover:text-primary/80"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(resource.content) }} 
                  />
                </CardContent>
              </Card>
            )}

            {/* VIP Content Block */}
            {resource.vip_content && (
              <div className="mb-6">
                <VipContentBlock
                  content={resource.vip_content}
                  isVip={isUserVip()}
                  isLoggedIn={!!user}
                />
              </div>
            )}

            {/* Related Resources */}
            {relatedResources.length > 0 && (
              <div>
                <h2 className="section-title">相关推荐</h2>
                <div className="space-y-3">
                  {relatedResources.map((res) => (
                    <ResourceCard 
                      key={res.id} 
                      id={res.id}
                      title={res.title}
                      examName={res.exam?.name || ""}
                      resourceType={res.resource_type}
                      accessType={res.access_type}
                      year={res.year || undefined}
                      downloadCount={res.download_count || 0}
                      isHot={res.is_hot || false}
                      isNew={res.is_new || false}
                      slug={res.slug}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Download Card */}
            <Card className="lg:sticky lg:top-20">
              <CardContent className="p-4 md:p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">下载资料</h3>
                
                {resource.access_type === "免费" ? (
                  <>
                    <p className="text-sm text-muted-foreground mb-4">
                      此资料为免费资源，登录后即可下载
                    </p>
                    <Button className="w-full bg-gradient-success hover:opacity-90 mb-3">
                      <Download className="w-4 h-4 mr-2" />
                      免费下载
                    </Button>
                  </>
                ) : resource.access_type === "VIP" ? (
                  <>
                    <p className="text-sm text-muted-foreground mb-4">
                      此资料为VIP专属资源，开通VIP后可无限下载
                    </p>
                    <Button className="w-full bg-gradient-accent hover:opacity-90 mb-3">
                      <Download className="w-4 h-4 mr-2" />
                      VIP下载
                    </Button>
                    <Button variant="outline" className="w-full">
                      开通VIP会员
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground mb-4">
                      此资料需要 <strong className="text-warning">{resource.points_required || 10}积分</strong> 兑换
                    </p>
                    <Button className="w-full bg-gradient-primary hover:opacity-90 mb-3">
                      <Download className="w-4 h-4 mr-2" />
                      积分兑换
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      当前积分：<strong>0</strong>，<Link to="/earn-points" className="text-primary hover:underline">获取更多积分</Link>
                    </p>
                  </>
                )}

                <Separator className="my-4" />

                <div className="flex items-center justify-between">
                  <Button variant="ghost" size="sm" className="flex-1">
                    <Eye className="w-4 h-4 mr-1" />
                    预览
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1">
                    <Share2 className="w-4 h-4 mr-1" />
                    分享
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Meta Info - hidden on mobile (info already shown above) */}
            <Card className="hidden lg:block">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">资料信息</h3>
                <div className="space-y-3 text-sm">
                  {resource.exam && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">所属考试</span>
                      <Link to={`/exam/${resource.exam.slug}`} className="text-primary hover:underline">
                        {resource.exam.name}
                      </Link>
                    </div>
                  )}
                  {resource.subject && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">科目</span>
                      <span className="text-foreground">{resource.subject}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">资料类型</span>
                    <Badge variant="outline">{resource.resource_type}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">上传时间</span>
                    <span className="text-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(resource.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">更新时间</span>
                    <span className="text-foreground">{formatDate(resource.updated_at)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ResourceDetail;

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ExamCountdown } from "@/components/ExamCountdown";
import { ResourceCard } from "@/components/ResourceCard";
import { StatsCard } from "@/components/StatsCard";
import { CategoryCard } from "@/components/CategoryCard";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";
import { SearchBar } from "@/components/SearchBar";
import { supabase } from "@/integrations/supabase/client";
import { 
  FileText, 
  Download, 
  Users, 
  TrendingUp, 
  Flame,
  Gift,
  ChevronRight,
  BookOpen,
  Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface Announcement {
  id: string;
  title: string;
  link: string | null;
  type: string | null;
}

interface Exam {
  id: string;
  name: string;
  exam_date: string | null;
  icon: string | null;
  slug: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

interface Resource {
  id: string;
  title: string;
  slug: string;
  resource_type: string;
  access_type: string;
  year: number | null;
  download_count: number | null;
  is_hot: boolean | null;
  is_new: boolean | null;
  exam_id: string;
}

interface ResourceWithExam extends Resource {
  examName: string;
}

const Index = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newResources, setNewResources] = useState<ResourceWithExam[]>([]);
  const [hotResources, setHotResources] = useState<ResourceWithExam[]>([]);
  const [freeResources, setFreeResources] = useState<ResourceWithExam[]>([]);
  const [stats, setStats] = useState({ resources: 0, downloads: 0, categories: 0, exams: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch all data in parallel
      const [
        announcementsRes,
        examsRes,
        categoriesRes,
        newResourcesRes,
        hotResourcesRes,
        freeResourcesRes,
        resourceCountRes,
        downloadCountRes
      ] = await Promise.all([
        supabase.from('announcements').select('id, title, link, type').eq('is_active', true).order('is_pinned', { ascending: false }).limit(3),
        supabase.from('exams').select('id, name, exam_date, icon, slug').eq('is_active', true).not('exam_date', 'is', null).order('exam_date', { ascending: true }).limit(4),
        supabase.from('exam_categories').select('id, name, slug, icon').eq('is_active', true).order('sort_order', { ascending: true }),
        supabase.from('resources').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(4),
        supabase.from('resources').select('*').eq('is_active', true).eq('is_hot', true).order('download_count', { ascending: false }).limit(4),
        supabase.from('resources').select('*').eq('is_active', true).eq('access_type', '免费').order('download_count', { ascending: false }).limit(3),
        supabase.from('resources').select('id', { count: 'exact', head: true }),
        supabase.from('download_history').select('id', { count: 'exact', head: true })
      ]);

      if (announcementsRes.data) setAnnouncements(announcementsRes.data);
      if (examsRes.data) setExams(examsRes.data);
      if (categoriesRes.data) setCategories(categoriesRes.data);

      // Get exam names for resources
      const allExamIds = [
        ...(newResourcesRes.data || []).map(r => r.exam_id),
        ...(hotResourcesRes.data || []).map(r => r.exam_id),
        ...(freeResourcesRes.data || []).map(r => r.exam_id)
      ];
      const uniqueExamIds = [...new Set(allExamIds)];
      
      const { data: examNames } = await supabase
        .from('exams')
        .select('id, name')
        .in('id', uniqueExamIds);
      
      const examNameMap = new Map(examNames?.map(e => [e.id, e.name]) || []);

      const mapResources = (resources: Resource[]): ResourceWithExam[] => 
        resources.map(r => ({ ...r, examName: examNameMap.get(r.exam_id) || '未知考试' }));

      if (newResourcesRes.data) setNewResources(mapResources(newResourcesRes.data));
      if (hotResourcesRes.data) setHotResources(mapResources(hotResourcesRes.data));
      if (freeResourcesRes.data) setFreeResources(mapResources(freeResourcesRes.data));

      setStats({
        resources: resourceCountRes.count || 0,
        downloads: downloadCountRes.count || 0,
        categories: categoriesRes.data?.length || 0,
        exams: examsRes.data?.length || 0
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBanner announcements={announcements.map(a => ({
        id: a.id,
        title: a.title,
        link: a.link || undefined,
        type: (a.type as 'info' | 'promo' | 'warning') || 'info'
      }))} />
      <Header />

      {/* Hero Section with Search */}
      <section className="bg-gradient-primary py-8 md:py-16">
        <div className="container">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-xl md:text-4xl font-bold text-primary-foreground mb-2 md:mb-3">
              专业备考资料，助你一次通过
            </h2>
            <p className="text-primary-foreground/80 text-sm md:text-lg">
              汇集全网最新考试真题、精品课件、押题密卷
            </p>
          </div>
          <SearchBar variant="hero" />
          
          {/* Quick stats */}
          <div className="flex items-center justify-center gap-4 md:gap-8 mt-6 md:mt-8 text-primary-foreground/90">
            <div className="text-center">
              <div className="text-lg md:text-2xl font-bold">{stats.resources.toLocaleString()}+</div>
              <div className="text-xs md:text-sm">优质资料</div>
            </div>
            <div className="w-px h-8 md:h-10 bg-primary-foreground/30" />
            <div className="text-center">
              <div className="text-lg md:text-2xl font-bold">{stats.categories}+</div>
              <div className="text-xs md:text-sm">考试类型</div>
            </div>
            <div className="w-px h-8 md:h-10 bg-primary-foreground/30" />
            <div className="text-center">
              <div className="text-lg md:text-2xl font-bold">{stats.downloads.toLocaleString()}+</div>
              <div className="text-xs md:text-sm">下载次数</div>
            </div>
          </div>
        </div>
      </section>

      {/* Countdown Section */}
      {exams.length > 0 && (
        <section className="py-4 md:py-8 bg-muted/50">
          <div className="container">
            <div className="section-title text-base md:text-xl">
              <span>考试倒计时</span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
              {exams.map((exam) => (
                <ExamCountdown
                  key={exam.id}
                  examName={exam.name}
                  examDate={exam.exam_date ? new Date(exam.exam_date) : new Date()}
                  icon={exam.icon || "📝"}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="container py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-5 md:space-y-8">
            {/* Today's New Resources */}
            {newResources.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-2 md:mb-4">
                  <div className="section-title text-base md:text-xl mb-0">
                    <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                    <span>今日更新</span>
                    <span className="tag-new ml-1 md:ml-2">+{newResources.length}</span>
                  </div>
                  <Link to="/new" className="text-xs md:text-sm text-primary hover:underline flex items-center gap-1">
                    查看全部 <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
                  </Link>
                </div>
                <div className="bg-card rounded-lg border border-border divide-y divide-border/50 px-2 md:px-4">
                  {newResources.map((resource) => (
                    <ResourceCard 
                      key={resource.id} 
                      id={resource.id}
                      title={resource.title}
                      slug={resource.slug}
                      examName={resource.examName}
                      resourceType={resource.resource_type}
                      accessType={resource.access_type}
                      year={resource.year || undefined}
                      downloadCount={resource.download_count || 0}
                      isHot={resource.is_hot || false}
                      isNew={resource.is_new || false}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Hot Resources */}
            {hotResources.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-2 md:mb-4">
                  <div className="section-title text-base md:text-xl mb-0">
                    <Flame className="w-4 h-4 md:w-5 md:h-5 text-accent" />
                    <span>热门下载</span>
                  </div>
                  <Link to="/hot" className="text-xs md:text-sm text-primary hover:underline flex items-center gap-1">
                    查看全部 <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
                  </Link>
                </div>
                <div className="bg-card rounded-lg border border-border divide-y divide-border/50 px-2 md:px-4">
                  {hotResources.map((resource) => (
                    <ResourceCard 
                      key={resource.id} 
                      id={resource.id}
                      title={resource.title}
                      slug={resource.slug}
                      examName={resource.examName}
                      resourceType={resource.resource_type}
                      accessType={resource.access_type}
                      year={resource.year || undefined}
                      downloadCount={resource.download_count || 0}
                      isHot={resource.is_hot || false}
                      isNew={resource.is_new || false}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Free Resources */}
            {freeResources.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-2 md:mb-4">
                  <div className="section-title text-base md:text-xl mb-0">
                    <Gift className="w-4 h-4 md:w-5 md:h-5 text-success" />
                    <span>免费专区</span>
                  </div>
                  <Link to="/free" className="text-xs md:text-sm text-primary hover:underline flex items-center gap-1">
                    查看全部 <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
                  </Link>
                </div>
                <div className="bg-card rounded-lg border border-border divide-y divide-border/50 px-2 md:px-4">
                  {freeResources.map((resource) => (
                    <ResourceCard 
                      key={resource.id} 
                      id={resource.id}
                      title={resource.title}
                      slug={resource.slug}
                      examName={resource.examName}
                      resourceType={resource.resource_type}
                      accessType={resource.access_type}
                      year={resource.year || undefined}
                      downloadCount={resource.download_count || 0}
                      isHot={resource.is_hot || false}
                      isNew={resource.is_new || false}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4 md:space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-4 lg:grid-cols-2 gap-2 md:gap-4">
              <StatsCard
                icon={<FileText className="w-6 h-6" />}
                value={stats.resources.toLocaleString()}
                label="资料总数"
              />
              <StatsCard
                icon={<Download className="w-6 h-6" />}
                value={stats.downloads.toLocaleString()}
                label="累计下载"
              />
              <StatsCard
                icon={<Users className="w-6 h-6" />}
                value={stats.categories}
                label="分类数量"
              />
              <StatsCard
                icon={<BookOpen className="w-6 h-6" />}
                value={stats.exams}
                label="考试数量"
              />
            </div>

            {/* Categories */}
            <div>
              <div className="section-title">
                <span>考试分类</span>
              </div>
              <div className="space-y-3">
                {categories.map((category) => (
                  <CategoryCard 
                    key={category.id} 
                    name={category.name}
                    slug={category.slug}
                    icon={category.icon || "📝"}
                  />
                ))}
              </div>
            </div>

            {/* Promo Card */}
            <div className="bg-gradient-accent rounded-xl p-4 md:p-6 text-white hidden md:block">
              <h3 className="text-lg font-bold mb-2">📚 教材代发服务</h3>
              <p className="text-sm text-white/90 mb-4">
                官方正版教材，全国包邮，下单即送配套电子资料
              </p>
              <Button variant="secondary" className="w-full bg-white text-accent hover:bg-white/90">
                立即购买
              </Button>
            </div>

            {/* VIP Card */}
            <div className="bg-card rounded-xl p-4 md:p-6 border border-border hidden md:block">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">👑</span>
                <h3 className="text-lg font-bold text-foreground">开通VIP会员</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                  全站资料免费下载
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                  独家押题密卷
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                  优先获取最新资料
                </li>
              </ul>
              <Button className="w-full bg-gradient-primary hover:opacity-90">
                立即开通
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Index;

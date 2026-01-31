import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ExamCountdown } from "@/components/ExamCountdown";
import { ResourceCard } from "@/components/ResourceCard";
import { StatsCard } from "@/components/StatsCard";
import { CategoryCard } from "@/components/CategoryCard";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";
import { SearchBar } from "@/components/SearchBar";
import { 
  FileText, 
  Download, 
  Users, 
  TrendingUp, 
  Flame,
  Gift,
  ChevronRight,
  BookOpen
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

// Mock data for demonstration
const mockAnnouncements = [
  { id: "1", title: "🎉 2024年一建真题已更新！限时免费下载", link: "/free", type: "promo" as const },
  { id: "2", title: "📚 新用户注册即送50积分，可兑换热门资料", link: "/register", type: "info" as const },
];

const mockExams = [
  { name: "一级建造师", date: new Date("2025-09-06"), icon: "🏗️" },
  { name: "二级建造师", date: new Date("2025-05-31"), icon: "🏢" },
  { name: "造价工程师", date: new Date("2025-10-18"), icon: "💰" },
  { name: "消防工程师", date: new Date("2025-11-08"), icon: "🚒" },
];

const mockCategories = [
  { name: "建筑工程", slug: "jianzhu", icon: "🏗️", examCount: 8, resourceCount: 1250 },
  { name: "财经会计", slug: "caijing", icon: "📊", examCount: 6, resourceCount: 890 },
  { name: "消防安全", slug: "xiaofang", icon: "🚒", examCount: 3, resourceCount: 450 },
  { name: "医药卫生", slug: "yiyao", icon: "🏥", examCount: 5, resourceCount: 680 },
  { name: "教育培训", slug: "jiaoyu", icon: "📚", examCount: 4, resourceCount: 520 },
  { name: "其他考试", slug: "qita", icon: "📝", examCount: 10, resourceCount: 760 },
];

const mockNewResources = [
  { id: "1", title: "2024年一级建造师《建设工程经济》真题及答案", examName: "一级建造师", resourceType: "真题", accessType: "免费", year: 2024, downloadCount: 3256, isHot: true, isNew: true, slug: "yijian-jingji-2024" },
  { id: "2", title: "2024年一级建造师《建设工程法规》真题及答案", examName: "一级建造师", resourceType: "真题", accessType: "免费", year: 2024, downloadCount: 2890, isNew: true, slug: "yijian-fagui-2024" },
  { id: "3", title: "2024年二级建造师《建筑工程》冲刺课件", examName: "二级建造师", resourceType: "课件", accessType: "积分", year: 2024, downloadCount: 1560, isNew: true, slug: "erjian-jianzhu-kejian-2024" },
  { id: "4", title: "2024年造价工程师《工程计价》押题密卷", examName: "造价工程师", resourceType: "押题", accessType: "VIP", year: 2024, downloadCount: 980, isHot: true, slug: "zaojia-jijia-yati-2024" },
];

const mockHotResources = [
  { id: "5", title: "一级建造师《项目管理》历年真题合集(2015-2024)", examName: "一级建造师", resourceType: "真题", accessType: "积分", downloadCount: 8920, isHot: true, slug: "yijian-xiangmu-linian" },
  { id: "6", title: "二级建造师全科精讲班课件【完整版】", examName: "二级建造师", resourceType: "课件", accessType: "VIP", downloadCount: 6750, isHot: true, slug: "erjian-quanke-kejian" },
  { id: "7", title: "消防工程师《技术实务》知识点总结PDF", examName: "消防工程师", resourceType: "课件", accessType: "免费", downloadCount: 5430, slug: "xiaofang-jishu-zongjie" },
  { id: "8", title: "2024年注册会计师CPA全科押题卷", examName: "注册会计师", resourceType: "押题", accessType: "VIP", downloadCount: 4280, isHot: true, slug: "cpa-quanke-yati-2024" },
];

const mockFreeResources = [
  { id: "9", title: "建造师公共科目复习策略与时间规划", examName: "一级建造师", resourceType: "其他", accessType: "免费", downloadCount: 2150, slug: "jzs-fuxi-celue" },
  { id: "10", title: "2023年一级造价师《案例分析》真题答案", examName: "造价工程师", resourceType: "真题", accessType: "免费", year: 2023, downloadCount: 1890, slug: "zaojia-anli-2023" },
  { id: "11", title: "消防规范速记口诀大全", examName: "消防工程师", resourceType: "课件", accessType: "免费", downloadCount: 3420, slug: "xiaofang-guifan-koujue" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBanner announcements={mockAnnouncements} />
      <Header />

      {/* Hero Section with Search */}
      <section className="bg-gradient-primary py-12 md:py-16">
        <div className="container">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-4xl font-bold text-primary-foreground mb-3">
              专业备考资料，助你一次通过
            </h2>
            <p className="text-primary-foreground/80 text-lg">
              汇集全网最新考试真题、精品课件、押题密卷
            </p>
          </div>
          <SearchBar variant="hero" />
          
          {/* Quick stats */}
          <div className="flex items-center justify-center gap-8 mt-8 text-primary-foreground/90">
            <div className="text-center">
              <div className="text-2xl font-bold">50,000+</div>
              <div className="text-sm">优质资料</div>
            </div>
            <div className="w-px h-10 bg-primary-foreground/30" />
            <div className="text-center">
              <div className="text-2xl font-bold">100+</div>
              <div className="text-sm">考试类型</div>
            </div>
            <div className="w-px h-10 bg-primary-foreground/30" />
            <div className="text-center">
              <div className="text-2xl font-bold">200万+</div>
              <div className="text-sm">下载次数</div>
            </div>
          </div>
        </div>
      </section>

      {/* Countdown Section */}
      <section className="py-8 bg-muted/50">
        <div className="container">
          <div className="section-title">
            <span>考试倒计时</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {mockExams.map((exam, index) => (
              <ExamCountdown
                key={index}
                examName={exam.name}
                examDate={exam.date}
                icon={exam.icon}
              />
            ))}
          </div>
        </div>
      </section>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Today's New Resources */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="section-title">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <span>今日更新</span>
                  <span className="tag-new ml-2">+{mockNewResources.length}</span>
                </div>
                <Link to="/new" className="text-sm text-primary hover:underline flex items-center gap-1">
                  查看全部 <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="space-y-3">
                {mockNewResources.map((resource) => (
                  <ResourceCard key={resource.id} {...resource} />
                ))}
              </div>
            </section>

            {/* Hot Resources */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="section-title">
                  <Flame className="w-5 h-5 text-accent" />
                  <span>热门下载</span>
                </div>
                <Link to="/hot" className="text-sm text-primary hover:underline flex items-center gap-1">
                  查看全部 <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="space-y-3">
                {mockHotResources.map((resource) => (
                  <ResourceCard key={resource.id} {...resource} />
                ))}
              </div>
            </section>

            {/* Free Resources */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="section-title">
                  <Gift className="w-5 h-5 text-success" />
                  <span>免费专区</span>
                </div>
                <Link to="/free" className="text-sm text-primary hover:underline flex items-center gap-1">
                  查看全部 <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="space-y-3">
                {mockFreeResources.map((resource) => (
                  <ResourceCard key={resource.id} {...resource} />
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <StatsCard
                icon={<FileText className="w-6 h-6" />}
                value="52,380"
                label="资料总数"
              />
              <StatsCard
                icon={<Download className="w-6 h-6" />}
                value="2,158,920"
                label="累计下载"
              />
              <StatsCard
                icon={<Users className="w-6 h-6" />}
                value="98,560"
                label="注册用户"
              />
              <StatsCard
                icon={<BookOpen className="w-6 h-6" />}
                value={128}
                label="今日更新"
                trend="↑ 12%"
              />
            </div>

            {/* Categories */}
            <div>
              <div className="section-title">
                <span>考试分类</span>
              </div>
              <div className="space-y-3">
                {mockCategories.map((category) => (
                  <CategoryCard key={category.slug} {...category} />
                ))}
              </div>
            </div>

            {/* Promo Card */}
            <div className="bg-gradient-accent rounded-xl p-6 text-white">
              <h3 className="text-lg font-bold mb-2">📚 教材代发服务</h3>
              <p className="text-sm text-white/90 mb-4">
                官方正版教材，全国包邮，下单即送配套电子资料
              </p>
              <Button variant="secondary" className="w-full bg-white text-accent hover:bg-white/90">
                立即购买
              </Button>
            </div>

            {/* VIP Card */}
            <div className="bg-card rounded-xl p-6 border border-border">
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

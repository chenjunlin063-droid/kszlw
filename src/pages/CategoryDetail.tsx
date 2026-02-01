import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useParams, Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Mock data - should match Categories.tsx
const mockCategories: Record<string, {
  name: string;
  icon: string;
  description: string;
  exams: { name: string; slug: string; resourceCount: number }[];
}> = {
  jianzhu: {
    name: "建筑工程",
    icon: "🏗️",
    description: "建筑工程类职业资格考试，包括建造师、建筑师、结构师等",
    exams: [
      { name: "一级建造师", slug: "yijian", resourceCount: 1250 },
      { name: "二级建造师", slug: "erjian", resourceCount: 980 },
      { name: "注册建筑师", slug: "zhucejianzhushi", resourceCount: 450 },
      { name: "注册结构师", slug: "zhucejiegoushi", resourceCount: 320 },
      { name: "监理工程师", slug: "jianli", resourceCount: 280 },
      { name: "咨询工程师", slug: "zixun", resourceCount: 210 },
    ],
  },
  caijing: {
    name: "财经会计",
    icon: "📊",
    description: "财经会计类职业资格考试，包括注册会计师、初中级会计等",
    exams: [
      { name: "注册会计师", slug: "cpa", resourceCount: 890 },
      { name: "初级会计", slug: "chujikuaiji", resourceCount: 650 },
      { name: "中级会计", slug: "zhongjikuaiji", resourceCount: 520 },
      { name: "税务师", slug: "shuiwushi", resourceCount: 380 },
      { name: "经济师", slug: "jingjishi", resourceCount: 290 },
    ],
  },
  xiaofang: {
    name: "消防安全",
    icon: "🚒",
    description: "消防安全类职业资格考试，包括消防工程师、安全工程师等",
    exams: [
      { name: "一级消防工程师", slug: "yixiaofang", resourceCount: 450 },
      { name: "二级消防工程师", slug: "erxiaofang", resourceCount: 280 },
      { name: "安全工程师", slug: "anquan", resourceCount: 350 },
    ],
  },
  yiyao: {
    name: "医药卫生",
    icon: "🏥",
    description: "医药卫生类职业资格考试，包括执业医师、执业药师等",
    exams: [
      { name: "执业医师", slug: "zhiyeyishi", resourceCount: 680 },
      { name: "执业药师", slug: "zhiyeyaoshi", resourceCount: 520 },
      { name: "护士资格", slug: "hushi", resourceCount: 410 },
      { name: "卫生资格", slug: "weisheng", resourceCount: 350 },
    ],
  },
  zaojia: {
    name: "工程造价",
    icon: "💰",
    description: "工程造价类职业资格考试，包括造价师、预算员等",
    exams: [
      { name: "一级造价师", slug: "yizaojia", resourceCount: 520 },
      { name: "二级造价师", slug: "erzaojia", resourceCount: 380 },
      { name: "预算员", slug: "yusuan", resourceCount: 260 },
    ],
  },
  jiaoyu: {
    name: "教育培训",
    icon: "📚",
    description: "教育培训类职业资格考试，包括教师资格证、心理咨询师等",
    exams: [
      { name: "教师资格证", slug: "jiaoshi", resourceCount: 520 },
      { name: "心理咨询师", slug: "xinli", resourceCount: 310 },
      { name: "社会工作者", slug: "shehui", resourceCount: 280 },
    ],
  },
  falv: {
    name: "法律资格",
    icon: "⚖️",
    description: "法律类职业资格考试，包括法律职业资格考试等",
    exams: [
      { name: "法律职业资格", slug: "falvzhiye", resourceCount: 380 },
      { name: "法律顾问", slug: "falvguwen", resourceCount: 210 },
    ],
  },
  qita: {
    name: "其他考试",
    icon: "📝",
    description: "其他职业资格考试，包括公务员、事业单位等",
    exams: [
      { name: "公务员考试", slug: "gongwuyuan", resourceCount: 760 },
      { name: "事业单位", slug: "shiye", resourceCount: 450 },
      { name: "英语等级", slug: "yingyu", resourceCount: 380 },
    ],
  },
};

const CategoryDetail = () => {
  const { slug } = useParams<{ slug: string }>();

  const category = slug ? mockCategories[slug] : null;

  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">分类不存在</h1>
          <p className="text-muted-foreground mb-6">抱歉，您访问的分类不存在或已被删除</p>
          <Link to="/categories" className="text-primary hover:underline">
            返回分类列表
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
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-primary">首页</Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <Link to="/categories" className="text-muted-foreground hover:text-primary">考试分类</Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground font-medium">{category.name}</span>
          </nav>
        </div>
      </div>

      {/* Category Header */}
      <div className="bg-card border-b border-border">
        <div className="container py-6">
          <div className="flex items-start gap-4">
            <div className="text-5xl">{category.icon}</div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground mb-2">{category.name}</h1>
              <p className="text-muted-foreground mb-3">{category.description}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>共 <strong className="text-primary">{category.exams.length}</strong> 个考试类型</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Exams List */}
      <div className="container py-8">
        <h2 className="text-xl font-bold text-foreground mb-6">考试列表</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {category.exams.map((exam) => (
            <Link
              key={exam.slug}
              to={`/exam/${exam.slug}`}
              className="block bg-card rounded-xl p-5 border border-border hover:border-primary/50 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                    {exam.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {exam.resourceCount} 份资料
                  </p>
                </div>
                <Badge variant="outline" className="group-hover:bg-primary/10">
                  查看
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CategoryDetail;

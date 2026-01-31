import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CategoryCard } from "@/components/CategoryCard";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const mockCategories = [
  { 
    name: "建筑工程", 
    slug: "jianzhu", 
    icon: "🏗️", 
    examCount: 8, 
    resourceCount: 1250,
    exams: ["一级建造师", "二级建造师", "注册建筑师", "注册结构师", "监理工程师", "咨询工程师"]
  },
  { 
    name: "财经会计", 
    slug: "caijing", 
    icon: "📊", 
    examCount: 6, 
    resourceCount: 890,
    exams: ["注册会计师", "初级会计", "中级会计", "税务师", "经济师"]
  },
  { 
    name: "消防安全", 
    slug: "xiaofang", 
    icon: "🚒", 
    examCount: 3, 
    resourceCount: 450,
    exams: ["一级消防工程师", "二级消防工程师", "安全工程师"]
  },
  { 
    name: "医药卫生", 
    slug: "yiyao", 
    icon: "🏥", 
    examCount: 5, 
    resourceCount: 680,
    exams: ["执业医师", "执业药师", "护士资格", "卫生资格"]
  },
  { 
    name: "工程造价", 
    slug: "zaojia", 
    icon: "💰", 
    examCount: 4, 
    resourceCount: 520,
    exams: ["一级造价师", "二级造价师", "预算员"]
  },
  { 
    name: "教育培训", 
    slug: "jiaoyu", 
    icon: "📚", 
    examCount: 4, 
    resourceCount: 520,
    exams: ["教师资格证", "心理咨询师", "社会工作者"]
  },
  { 
    name: "法律资格", 
    slug: "falv", 
    icon: "⚖️", 
    examCount: 3, 
    resourceCount: 380,
    exams: ["法律职业资格", "法律顾问"]
  },
  { 
    name: "其他考试", 
    slug: "qita", 
    icon: "📝", 
    examCount: 10, 
    resourceCount: 760,
    exams: ["公务员考试", "事业单位", "英语等级"]
  },
];

const Categories = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-muted/50 border-b border-border">
        <div className="container py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-primary">首页</Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground font-medium">考试分类</span>
          </nav>
        </div>
      </div>

      <div className="container py-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-foreground mb-3">考试分类</h1>
          <p className="text-muted-foreground">
            覆盖建筑、财经、消防、医药等多个领域的专业考试资料
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockCategories.map((category) => (
            <div key={category.slug} className="bg-card rounded-xl border border-border overflow-hidden card-hover">
              <Link to={`/category/${category.slug}`} className="block p-6">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{category.icon}</div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-foreground mb-2">{category.name}</h2>
                    <p className="text-sm text-muted-foreground mb-3">
                      {category.examCount} 个考试类型 · {category.resourceCount} 份资料
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {category.exams.slice(0, 4).map((exam) => (
                        <span key={exam} className="text-xs bg-muted px-2 py-1 rounded">
                          {exam}
                        </span>
                      ))}
                      {category.exams.length > 4 && (
                        <span className="text-xs text-primary">+{category.exams.length - 4}更多</span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Categories;

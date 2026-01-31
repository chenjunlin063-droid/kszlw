import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ResourceCard } from "@/components/ResourceCard";
import { useParams, Link } from "react-router-dom";
import { ChevronRight, Filter, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data
const mockExamData = {
  yijian: {
    name: "一级建造师",
    category: "建筑工程",
    icon: "🏗️",
    description: "一级建造师是建设工程行业的一种执业资格，是担任大型工程项目经理的前提条件。",
    resourceCount: 1250,
  },
  erjian: {
    name: "二级建造师",
    category: "建筑工程",
    icon: "🏢",
    description: "二级建造师是建筑类的一种职业资格，是担任项目经理的前提条件。",
    resourceCount: 980,
  },
};

const mockResources = [
  { id: "1", title: "2024年一级建造师《建设工程经济》真题及答案", examName: "一级建造师", resourceType: "真题", accessType: "免费", year: 2024, downloadCount: 3256, isHot: true, isNew: true, slug: "yijian-jingji-2024" },
  { id: "2", title: "2024年一级建造师《建设工程法规》真题及答案", examName: "一级建造师", resourceType: "真题", accessType: "免费", year: 2024, downloadCount: 2890, isNew: true, slug: "yijian-fagui-2024" },
  { id: "3", title: "2024年一级建造师《项目管理》真题及答案", examName: "一级建造师", resourceType: "真题", accessType: "积分", year: 2024, downloadCount: 2560, slug: "yijian-xiangmu-2024" },
  { id: "4", title: "2023年一级建造师《建设工程经济》真题及答案", examName: "一级建造师", resourceType: "真题", accessType: "免费", year: 2023, downloadCount: 4520, slug: "yijian-jingji-2023" },
  { id: "5", title: "一级建造师《项目管理》历年真题合集", examName: "一级建造师", resourceType: "真题", accessType: "VIP", downloadCount: 8920, isHot: true, slug: "yijian-xiangmu-linian" },
  { id: "6", title: "一级建造师全科精讲班课件【2024版】", examName: "一级建造师", resourceType: "课件", accessType: "VIP", year: 2024, downloadCount: 6750, isHot: true, slug: "yijian-quanke-kejian" },
  { id: "7", title: "一级建造师《法规》知识点思维导图", examName: "一级建造师", resourceType: "课件", accessType: "免费", downloadCount: 3420, slug: "yijian-fagui-siwei" },
  { id: "8", title: "2024年一级建造师考前押题密卷", examName: "一级建造师", resourceType: "押题", accessType: "VIP", year: 2024, downloadCount: 4280, isHot: true, slug: "yijian-yati-2024" },
];

const years = [2024, 2023, 2022, 2021, 2020];
const resourceTypes = ["全部", "真题", "课件", "押题", "教材", "其他"];
const accessTypes = ["全部", "免费", "积分", "VIP"];

const ExamCategory = () => {
  const { slug } = useParams<{ slug: string }>();
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedType, setSelectedType] = useState("全部");
  const [selectedAccess, setSelectedAccess] = useState("全部");

  const examData = mockExamData[slug as keyof typeof mockExamData] || {
    name: "考试资料",
    category: "其他",
    icon: "📝",
    description: "暂无描述",
    resourceCount: 0,
  };

  // Filter resources based on selections
  const filteredResources = mockResources.filter((resource) => {
    if (selectedYear !== "all" && resource.year !== parseInt(selectedYear)) return false;
    if (selectedType !== "全部" && resource.resourceType !== selectedType) return false;
    if (selectedAccess !== "全部" && resource.accessType !== selectedAccess) return false;
    return true;
  });

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
            <span className="text-foreground font-medium">{examData.name}</span>
          </nav>
        </div>
      </div>

      {/* Exam Header */}
      <div className="bg-card border-b border-border">
        <div className="container py-6">
          <div className="flex items-start gap-4">
            <div className="text-5xl">{examData.icon}</div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-foreground">{examData.name}</h1>
                <Badge variant="outline">{examData.category}</Badge>
              </div>
              <p className="text-muted-foreground mb-3">{examData.description}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>共 <strong className="text-primary">{examData.resourceCount}</strong> 份资料</span>
                <span>|</span>
                <span>本页显示 <strong>{filteredResources.length}</strong> 份</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border-b border-border sticky top-16 z-40">
        <div className="container py-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">筛选：</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">年份：</span>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-24 h-8">
                  <SelectValue placeholder="全部" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">类型：</span>
              <div className="flex gap-1">
                {resourceTypes.map((type) => (
                  <Button
                    key={type}
                    variant={selectedType === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedType(type)}
                    className="h-8"
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">权限：</span>
              <div className="flex gap-1">
                {accessTypes.map((type) => (
                  <Button
                    key={type}
                    variant={selectedAccess === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedAccess(type)}
                    className="h-8"
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resource List */}
      <div className="container py-8">
        {filteredResources.length > 0 ? (
          <div className="space-y-3">
            {filteredResources.map((resource) => (
              <ResourceCard key={resource.id} {...resource} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Filter className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">暂无匹配资料</h3>
            <p className="text-muted-foreground">请调整筛选条件试试</p>
          </div>
        )}

        {/* Load more button */}
        {filteredResources.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="outline" size="lg">
              加载更多资料
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ExamCategory;

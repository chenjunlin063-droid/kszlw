import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ResourceCard } from "@/components/ResourceCard";
import { useParams, Link } from "react-router-dom";
import { ChevronRight, Filter, SlidersHorizontal, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface Exam {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  category_id: string | null;
  category?: {
    name: string;
  };
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

const years = [2024, 2023, 2022, 2021, 2020];
const resourceTypes = ["全部", "真题", "课件", "押题", "教材", "其他"];
const accessTypes = ["全部", "免费", "积分", "VIP"];

const ExamCategory = () => {
  const { slug } = useParams<{ slug: string }>();
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedType, setSelectedType] = useState("全部");
  const [selectedAccess, setSelectedAccess] = useState("全部");
  const [exam, setExam] = useState<Exam | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalResources, setTotalResources] = useState(0);

  useEffect(() => {
    if (slug) {
      fetchExamData();
    }
  }, [slug]);

  const fetchExamData = async () => {
    setIsLoading(true);
    try {
      // Fetch exam details with category
      const { data: examData, error: examError } = await supabase
        .from('exams')
        .select(`
          *,
          category:exam_categories(name)
        `)
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (examError) {
        console.error('Error fetching exam:', examError);
        return;
      }

      setExam(examData);

      // Fetch resources for this exam
      const { data: resourcesData, error: resourcesError } = await supabase
        .from('resources')
        .select('*')
        .eq('exam_id', examData.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (resourcesError) {
        console.error('Error fetching resources:', resourcesError);
        return;
      }

      setResources(resourcesData || []);
      setTotalResources(resourcesData?.length || 0);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter resources based on selections
  const filteredResources = resources.filter((resource) => {
    if (selectedYear !== "all" && resource.year !== parseInt(selectedYear)) return false;
    if (selectedType !== "全部" && resource.resource_type !== selectedType) return false;
    if (selectedAccess !== "全部" && resource.access_type !== selectedAccess) return false;
    return true;
  });

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

  if (!exam) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">考试不存在</h1>
          <p className="text-muted-foreground mb-6">未找到对应的考试信息</p>
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
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-primary">首页</Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <Link to="/categories" className="text-muted-foreground hover:text-primary">考试分类</Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground font-medium">{exam.name}</span>
          </nav>
        </div>
      </div>

      {/* Exam Header */}
      <div className="bg-card border-b border-border">
        <div className="container py-6">
          <div className="flex items-start gap-4">
            <div className="text-5xl">{exam.icon || "📝"}</div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-foreground">{exam.name}</h1>
                {exam.category && <Badge variant="outline">{exam.category.name}</Badge>}
              </div>
              <p className="text-muted-foreground mb-3">{exam.description || "暂无描述"}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>共 <strong className="text-primary">{totalResources}</strong> 份资料</span>
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
              <ResourceCard 
                key={resource.id} 
                id={resource.id}
                title={resource.title}
                examName={exam.name}
                resourceType={resource.resource_type}
                accessType={resource.access_type}
                year={resource.year || undefined}
                downloadCount={resource.download_count || 0}
                isHot={resource.is_hot || false}
                isNew={resource.is_new || false}
                slug={resource.slug}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Filter className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">暂无匹配资料</h3>
            <p className="text-muted-foreground">请调整筛选条件试试</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ExamCategory;

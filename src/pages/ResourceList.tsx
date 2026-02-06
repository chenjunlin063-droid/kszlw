import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ResourceCard } from "@/components/ResourceCard";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, TrendingUp, Flame, Gift } from "lucide-react";

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

const pageConfig: Record<string, { title: string; icon: React.ReactNode; description: string }> = {
  "/new": {
    title: "最新更新",
    icon: <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-primary" />,
    description: "全站最新上传的备考资料",
  },
  "/hot": {
    title: "热门下载",
    icon: <Flame className="w-5 h-5 md:w-6 md:h-6 text-accent" />,
    description: "大家都在下载的热门资料",
  },
  "/free": {
    title: "免费专区",
    icon: <Gift className="w-5 h-5 md:w-6 md:h-6 text-success" />,
    description: "无需积分或VIP，免费下载",
  },
};

const ResourceList = () => {
  const location = useLocation();
  const [resources, setResources] = useState<ResourceWithExam[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const config = pageConfig[location.pathname] || pageConfig["/new"];

  useEffect(() => {
    fetchResources();
  }, [location.pathname]);

  const fetchResources = async () => {
    setIsLoading(true);
    try {
      let query = supabase.from("resources").select("*").eq("is_active", true);

      if (location.pathname === "/new") {
        query = query.order("created_at", { ascending: false });
      } else if (location.pathname === "/hot") {
        query = query.eq("is_hot", true).order("download_count", { ascending: false });
      } else if (location.pathname === "/free") {
        query = query.eq("access_type", "免费").order("download_count", { ascending: false });
      }

      const { data } = await query.limit(50);

      if (data && data.length > 0) {
        const examIds = [...new Set(data.map((r) => r.exam_id))];
        const { data: exams } = await supabase.from("exams").select("id, name").in("id", examIds);
        const examMap = new Map(exams?.map((e) => [e.id, e.name]) || []);

        setResources(
          data.map((r) => ({ ...r, examName: examMap.get(r.exam_id) || "未知考试" }))
        );
      } else {
        setResources([]);
      }
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 md:py-10">
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-6">
          {config.icon}
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">{config.title}</h1>
            <p className="text-sm text-muted-foreground">{config.description}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : resources.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">暂无资料</div>
        ) : (
          <div className="bg-card rounded-lg border border-border px-2 md:px-4">
            {resources.map((resource) => (
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
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ResourceList;

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ResourceCard } from "@/components/ResourceCard";
import { useSearchParams, Link } from "react-router-dom";
import { ChevronRight, Search as SearchIcon, Filter, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

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
  exam?: {
    name: string;
  };
}

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(query);
  const [results, setResults] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (query) {
      searchResources();
    } else {
      setResults([]);
      setIsLoading(false);
    }
  }, [query]);

  const searchResources = async () => {
    setIsLoading(true);
    try {
      // Search resources by title
      const { data, error } = await supabase
        .from('resources')
        .select(`
          *,
          exam:exams(name)
        `)
        .eq('is_active', true)
        .ilike('title', `%${query}%`)
        .order('download_count', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error searching resources:', error);
        return;
      }

      setResults(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-muted/50 border-b border-border">
        <div className="container py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-primary">首页</Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground font-medium">搜索结果</span>
          </nav>
        </div>
      </div>

      <div className="container py-8">
        {/* Search box */}
        <div className="max-w-2xl mx-auto mb-8">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索考试资料..."
                className="w-full h-12 pl-12 text-lg"
              />
            </div>
            <Button type="submit" size="lg" className="bg-gradient-primary">
              搜索
            </Button>
          </form>
        </div>

        {/* Results header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground mb-2">
            搜索 "{query}" 的结果
          </h1>
          {!isLoading && (
            <p className="text-muted-foreground">
              共找到 <strong className="text-primary">{results.length}</strong> 份相关资料
            </p>
          )}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-3">
            {results.map((resource) => (
              <ResourceCard 
                key={resource.id} 
                id={resource.id}
                title={resource.title}
                examName={resource.exam?.name || ""}
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
            <h3 className="text-lg font-medium text-foreground mb-2">未找到相关资料</h3>
            <p className="text-muted-foreground mb-4">请尝试其他关键词</p>
            <Link to="/">
              <Button variant="outline">返回首页</Button>
            </Link>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default SearchResults;

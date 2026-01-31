import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ResourceCard } from "@/components/ResourceCard";
import { useSearchParams, Link } from "react-router-dom";
import { ChevronRight, Search as SearchIcon, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Mock search results
const mockResults = [
  { id: "1", title: "2024年一级建造师《建设工程经济》真题及答案", examName: "一级建造师", resourceType: "真题", accessType: "免费", year: 2024, downloadCount: 3256, isHot: true, isNew: true, slug: "yijian-jingji-2024" },
  { id: "2", title: "2024年一级建造师《建设工程法规》真题及答案", examName: "一级建造师", resourceType: "真题", accessType: "免费", year: 2024, downloadCount: 2890, isNew: true, slug: "yijian-fagui-2024" },
  { id: "5", title: "一级建造师《项目管理》历年真题合集(2015-2024)", examName: "一级建造师", resourceType: "真题", accessType: "积分", downloadCount: 8920, isHot: true, slug: "yijian-xiangmu-linian" },
];

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(query);

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
          <p className="text-muted-foreground">
            共找到 <strong className="text-primary">{mockResults.length}</strong> 份相关资料
          </p>
        </div>

        {/* Results */}
        {mockResults.length > 0 ? (
          <div className="space-y-3">
            {mockResults.map((resource) => (
              <ResourceCard key={resource.id} {...resource} />
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

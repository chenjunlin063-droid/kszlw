import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface SearchBarProps {
  variant?: "default" | "hero";
  placeholder?: string;
}

export const SearchBar = ({ 
  variant = "default", 
  placeholder = "搜索考试资料、真题、课件..." 
}: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  if (variant === "hero") {
    return (
      <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full h-14 pl-12 pr-28 text-lg bg-card border-2 border-border focus:border-primary rounded-xl shadow-lg"
          />
          <Button 
            type="submit" 
            className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-6 bg-gradient-primary hover:opacity-90"
          >
            搜索
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSearch} className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-10 bg-white/10 border-white/20 text-primary-foreground placeholder:text-primary-foreground/60 focus:bg-white/20"
        />
      </div>
      <Button type="submit" variant="secondary" size="sm">
        搜索
      </Button>
    </form>
  );
};

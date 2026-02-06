import { Download, Eye, FileText, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface ResourceCardProps {
  id: string;
  title: string;
  examName: string;
  resourceType: string;
  accessType: string;
  year?: number;
  downloadCount: number;
  isHot?: boolean;
  isNew?: boolean;
  slug: string;
}

export const ResourceCard = ({
  id,
  title,
  examName,
  resourceType,
  accessType,
  year,
  downloadCount,
  isHot,
  isNew,
  slug,
}: ResourceCardProps) => {
  const isMobile = useIsMobile();

  const getAccessTypeClass = (type: string) => {
    switch (type) {
      case "免费":
        return "tag-free";
      case "VIP":
        return "tag-vip";
      case "积分":
        return "bg-warning text-warning-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  // Mobile: compact title-based list
  if (isMobile) {
    return (
      <Link to={`/resource/${slug}`} className="block">
        <div className="flex items-center gap-2 py-2.5 px-3 bg-card rounded-lg border border-border group">
          <div className="flex-1 min-w-0 flex items-center gap-1.5">
            {isNew && <span className="tag-new flex-shrink-0 text-[10px] px-1.5 py-0">新</span>}
            {isHot && <span className="tag-hot flex-shrink-0 text-[10px] px-1.5 py-0">热</span>}
            <span className={`flex-shrink-0 text-[10px] px-1.5 py-0 rounded ${getAccessTypeClass(accessType)}`}>
              {accessType}
            </span>
            <h3 className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
              {title}
            </h3>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        </div>
      </Link>
    );
  }

  // Desktop: full card layout
  return (
    <Link to={`/resource/${slug}`} className="block">
      <div className="resource-item group">
        <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
          <FileText className="w-4 h-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
              {title}
            </h3>
            {isNew && <span className="tag-new">新</span>}
            {isHot && <span className="tag-hot">热</span>}
          </div>
          
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>{examName}</span>
            {year && <span>{year}年</span>}
            <Badge variant="outline" className="text-xs">
              {resourceType}
            </Badge>
            <span className={getAccessTypeClass(accessType)}>{accessType}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <Download className="w-4 h-4" />
            <span>{downloadCount}</span>
          </div>
          <Button size="sm" variant="outline" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <Eye className="w-4 h-4 mr-1" />
            查看
          </Button>
        </div>
      </div>
    </Link>
  );
};

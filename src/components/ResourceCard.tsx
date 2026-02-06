import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
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
  title,
  accessType,
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

  return (
    <Link to={`/resource/${slug}`} className="block group">
      <div className="flex items-center gap-2 py-2 md:py-2.5 px-1 md:px-2 border-b border-border/50 last:border-b-0 hover:bg-muted/30 transition-colors">
        <span className="w-1.5 h-1.5 rounded-full bg-primary/60 flex-shrink-0" />
        <div className="flex-1 min-w-0 flex items-center gap-1.5">
          {!isMobile && isNew && <span className="tag-new flex-shrink-0 text-[10px] px-1.5 py-0">新</span>}
          {!isMobile && isHot && <span className="tag-hot flex-shrink-0 text-[10px] px-1.5 py-0">热</span>}
          {!isMobile && (
            <span className={`flex-shrink-0 text-[10px] md:text-xs px-1.5 py-0 rounded ${getAccessTypeClass(accessType)}`}>
              {accessType}
            </span>
          )}
          <h3 className="text-sm md:text-[15px] text-foreground truncate group-hover:text-primary transition-colors">
            {title}
          </h3>
        </div>
        <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4 text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </Link>
  );
};

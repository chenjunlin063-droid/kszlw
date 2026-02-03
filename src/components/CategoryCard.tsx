import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface CategoryCardProps {
  name: string;
  slug: string;
  icon?: string;
  examCount?: number;
  resourceCount?: number;
}

export const CategoryCard = ({
  name,
  slug,
  icon,
  examCount,
  resourceCount,
}: CategoryCardProps) => {
  return (
    <Link to={`/category/${slug}`} className="block">
      <div className="bg-card rounded-xl p-5 border border-border card-hover group">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="text-3xl">{icon}</div>
            )}
            <div>
              <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                {name}
              </h3>
              {(examCount !== undefined || resourceCount !== undefined) && (
                <p className="text-sm text-muted-foreground mt-1">
                  {examCount !== undefined && `${examCount} 个考试`}
                  {examCount !== undefined && resourceCount !== undefined && ' · '}
                  {resourceCount !== undefined && `${resourceCount} 份资料`}
                </p>
              )}
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </Link>
  );
};

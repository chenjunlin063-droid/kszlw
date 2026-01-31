import { useState } from "react";
import { X, Megaphone, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

interface Announcement {
  id: string;
  title: string;
  link?: string;
  type: "info" | "promo" | "warning";
}

interface AnnouncementBannerProps {
  announcements: Announcement[];
}

export const AnnouncementBanner = ({ announcements }: AnnouncementBannerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || announcements.length === 0) return null;

  const current = announcements[currentIndex];

  const getBgClass = (type: string) => {
    switch (type) {
      case "promo":
        return "bg-gradient-accent";
      case "warning":
        return "bg-warning";
      default:
        return "bg-primary";
    }
  };

  return (
    <div className={`${getBgClass(current.type)} text-white py-2`}>
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Megaphone className="w-4 h-4 animate-pulse-subtle" />
          {current.link ? (
            <Link 
              to={current.link} 
              className="text-sm hover:underline flex items-center gap-1"
            >
              {current.title}
              <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <span className="text-sm">{current.title}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {announcements.length > 1 && (
            <div className="flex items-center gap-1 mr-2">
              {announcements.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? "bg-white" : "bg-white/40"
                  }`}
                />
              ))}
            </div>
          )}
          <button
            onClick={() => setDismissed(true)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

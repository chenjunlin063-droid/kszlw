import { useEffect, useState } from "react";
import { Calendar, Clock } from "lucide-react";

interface ExamCountdownProps {
  examName: string;
  examDate: Date;
  icon?: string;
}

export const ExamCountdown = ({ examName, examDate, icon }: ExamCountdownProps) => {
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    const calculateDays = () => {
      const now = new Date();
      const diff = examDate.getTime() - now.getTime();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      setDaysLeft(days > 0 ? days : 0);
    };

    calculateDays();
    const interval = setInterval(calculateDays, 1000 * 60 * 60); // Update every hour
    return () => clearInterval(interval);
  }, [examDate]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="countdown-card group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {icon && <span className="text-2xl">{icon}</span>}
            <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
              {examName}
            </h3>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(examDate)}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-muted-foreground text-sm mb-1">
            <Clock className="w-4 h-4" />
            <span>倒计时</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-primary animate-count-down">
              {daysLeft}
            </span>
            <span className="text-sm text-muted-foreground">天</span>
          </div>
        </div>
      </div>
    </div>
  );
};

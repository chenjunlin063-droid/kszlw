import { Link } from "react-router-dom";
import { BookOpen, Mail, Phone, MapPin } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-foreground text-background mt-8 md:mt-12">
      <div className="container py-8 md:py-12">
        {/* Mobile: compact 2-column layout */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {/* Brand - full width on mobile */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-primary rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 md:w-6 md:h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-base md:text-lg font-bold">考试资料网</h3>
                <p className="text-[10px] md:text-xs text-background/60">专业备考资料分享平台</p>
              </div>
            </div>
            <p className="text-xs md:text-sm text-background/70 leading-relaxed hidden md:block">
              致力于为广大考生提供最全面、最专业的考试真题、课件和备考资料，助力每一位考生顺利通过考试。
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-sm md:text-base mb-2 md:mb-4">快速链接</h4>
            <ul className="space-y-1.5 md:space-y-2">
              <li>
                <Link to="/categories" className="text-xs md:text-sm text-background/70 hover:text-background transition-colors">
                  考试分类
                </Link>
              </li>
              <li>
                <Link to="/free" className="text-xs md:text-sm text-background/70 hover:text-background transition-colors">
                  免费资料
                </Link>
              </li>
              <li>
                <Link to="/vip" className="text-xs md:text-sm text-background/70 hover:text-background transition-colors">
                  会员开通
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-sm md:text-base mb-2 md:mb-4">联系我们</h4>
            <ul className="space-y-1.5 md:space-y-3">
              <li className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-background/70">
                <Mail className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                <span className="truncate">contact@kaoshiziliao.com</span>
              </li>
              <li className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-background/70">
                <Phone className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                <span>400-888-8888</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-background/10 mt-6 md:mt-8 pt-4 md:pt-8 text-center md:text-left">
          <p className="text-[10px] md:text-sm text-background/50">
            © 2024 考试资料网. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

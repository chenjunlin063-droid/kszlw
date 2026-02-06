import { Link } from "react-router-dom";
import { BookOpen, Mail, Phone, MapPin } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-foreground text-background mt-12">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-bold">考试资料网</h3>
                <p className="text-xs text-background/60">专业备考资料分享平台</p>
              </div>
            </div>
            <p className="text-sm text-background/70 leading-relaxed">
              致力于为广大考生提供最全面、最专业的考试真题、课件和备考资料，助力每一位考生顺利通过考试。
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4">快速链接</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/categories" className="text-sm text-background/70 hover:text-background transition-colors">
                  考试分类
                </Link>
              </li>
              <li>
                <Link to="/free" className="text-sm text-background/70 hover:text-background transition-colors">
                  免费资料
                </Link>
              </li>
              <li>
                <Link to="/vip" className="text-sm text-background/70 hover:text-background transition-colors">
                  会员开通
                </Link>
              </li>
            </ul>
          </div>

          {/* Exam Categories */}
          <div>
            <h4 className="font-bold mb-4">热门考试</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/exam/yijian" className="text-sm text-background/70 hover:text-background transition-colors">
                  一级建造师
                </Link>
              </li>
              <li>
                <Link to="/exam/erjian" className="text-sm text-background/70 hover:text-background transition-colors">
                  二级建造师
                </Link>
              </li>
              <li>
                <Link to="/exam/zaojia" className="text-sm text-background/70 hover:text-background transition-colors">
                  造价工程师
                </Link>
              </li>
              <li>
                <Link to="/exam/xiaofang" className="text-sm text-background/70 hover:text-background transition-colors">
                  消防工程师
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4">联系我们</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-background/70">
                <Mail className="w-4 h-4" />
                <span>contact@kaoshiziliao.com</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-background/70">
                <Phone className="w-4 h-4" />
                <span>400-888-8888</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-background/70">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>北京市朝阳区</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-background/10 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-background/50">
            © 2024 考试资料网. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="text-sm text-background/50 hover:text-background transition-colors">
              隐私政策
            </Link>
            <Link to="/terms" className="text-sm text-background/50 hover:text-background transition-colors">
              服务条款
            </Link>
            <Link to="/disclaimer" className="text-sm text-background/50 hover:text-background transition-colors">
              免责声明
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

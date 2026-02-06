import { Link, useLocation } from "react-router-dom";
import { Menu, X, BookOpen, User, LogIn, Shield } from "lucide-react";
import { useState } from "react";
import { SearchBar } from "./SearchBar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { label: "首页", href: "/" },
  { label: "考试分类", href: "/categories" },
  { label: "免费专区", href: "/free" },
  { label: "会员开通", href: "/vip" },
];

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isAdmin, isLoading } = useAuth();

  return (
    <header className="header-gradient sticky top-0 z-50 shadow-lg">
      <div className="container">
        {/* Top bar */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary-foreground">考试资料网</h1>
              <p className="text-xs text-primary-foreground/70">专业备考资料分享平台</p>
            </div>
          </Link>

          {/* Search bar - hidden on mobile */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <SearchBar />
          </div>

          {/* Desktop navigation + auth */}
          <div className="hidden lg:flex items-center gap-1">
            <nav className="flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "nav-link",
                    location.pathname === item.href && "nav-link-active"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            
            <div className="ml-2 pl-2 border-l border-white/20 flex items-center gap-2">
              {!isLoading && (
                user ? (
                  <>
                    {isAdmin && (
                      <Link to="/admin">
                        <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-white/10">
                          <Shield className="w-4 h-4 mr-1" />
                          管理
                        </Button>
                      </Link>
                    )}
                    <Link to="/profile">
                      <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-white/10">
                        <User className="w-4 h-4 mr-1" />
                        个人中心
                      </Button>
                    </Link>
                  </>
                ) : (
                  <Link to="/auth">
                    <Button variant="secondary" size="sm" className="bg-white/20 text-primary-foreground hover:bg-white/30 border-0">
                      <LogIn className="w-4 h-4 mr-1" />
                      登录/注册
                    </Button>
                  </Link>
                )
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-primary-foreground hover:bg-white/10"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        {/* Mobile search bar */}
        <div className="md:hidden pb-3">
          <SearchBar />
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-primary/95 border-t border-white/10">
          <nav className="container py-4 flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "nav-link py-3",
                  location.pathname === item.href && "nav-link-active"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            
            <div className="border-t border-white/10 mt-2 pt-2">
              {!isLoading && (
                user ? (
                  <>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="nav-link py-3 flex items-center gap-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Shield className="w-4 h-4" />
                        管理后台
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      className="nav-link py-3 flex items-center gap-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      个人中心
                    </Link>
                  </>
                ) : (
                  <Link
                    to="/auth"
                    className="nav-link py-3 flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LogIn className="w-4 h-4" />
                    登录/注册
                  </Link>
                )
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

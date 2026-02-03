import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Link } from "react-router-dom";
import { ChevronRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

interface Exam {
  id: string;
  name: string;
  category_id: string | null;
}

interface CategoryWithExams extends Category {
  exams: string[];
  examCount: number;
  resourceCount: number;
}

const Categories = () => {
  const [categories, setCategories] = useState<CategoryWithExams[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      // Fetch categories and exams in parallel
      const [categoriesRes, examsRes, resourcesRes] = await Promise.all([
        supabase.from('exam_categories').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
        supabase.from('exams').select('id, name, category_id').eq('is_active', true),
        supabase.from('resources').select('exam_id').eq('is_active', true)
      ]);

      if (categoriesRes.data && examsRes.data) {
        // Group exams by category
        const examsByCategory = new Map<string, string[]>();
        const examIdsByCategory = new Map<string, string[]>();
        
        examsRes.data.forEach(exam => {
          if (exam.category_id) {
            const names = examsByCategory.get(exam.category_id) || [];
            names.push(exam.name);
            examsByCategory.set(exam.category_id, names);

            const ids = examIdsByCategory.get(exam.category_id) || [];
            ids.push(exam.id);
            examIdsByCategory.set(exam.category_id, ids);
          }
        });

        // Count resources per category
        const resourceCountByCategory = new Map<string, number>();
        if (resourcesRes.data) {
          const examToCategory = new Map(examsRes.data.map(e => [e.id, e.category_id]));
          resourcesRes.data.forEach(resource => {
            const categoryId = examToCategory.get(resource.exam_id);
            if (categoryId) {
              resourceCountByCategory.set(categoryId, (resourceCountByCategory.get(categoryId) || 0) + 1);
            }
          });
        }

        const categoriesWithExams: CategoryWithExams[] = categoriesRes.data.map(category => ({
          ...category,
          exams: examsByCategory.get(category.id) || [],
          examCount: (examsByCategory.get(category.id) || []).length,
          resourceCount: resourceCountByCategory.get(category.id) || 0
        }));

        setCategories(categoriesWithExams);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-muted/50 border-b border-border">
        <div className="container py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-primary">首页</Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground font-medium">考试分类</span>
          </nav>
        </div>
      </div>

      <div className="container py-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-foreground mb-3">考试分类</h1>
          <p className="text-muted-foreground">
            覆盖建筑、财经、消防、医药等多个领域的专业考试资料
          </p>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            暂无分类数据
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((category) => (
              <div key={category.id} className="bg-card rounded-xl border border-border overflow-hidden card-hover">
                <Link to={`/category/${category.slug}`} className="block p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{category.icon || "📝"}</div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-foreground mb-2">{category.name}</h2>
                      <p className="text-sm text-muted-foreground mb-3">
                        {category.examCount} 个考试类型 · {category.resourceCount} 份资料
                      </p>
                      {category.exams.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {category.exams.slice(0, 4).map((exam) => (
                            <span key={exam} className="text-xs bg-muted px-2 py-1 rounded">
                              {exam}
                            </span>
                          ))}
                          {category.exams.length > 4 && (
                            <span className="text-xs text-primary">+{category.exams.length - 4}更多</span>
                          )}
                        </div>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Categories;

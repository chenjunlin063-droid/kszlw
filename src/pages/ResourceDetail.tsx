import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useParams, Link } from "react-router-dom";
import { 
  ChevronRight, 
  Download, 
  FileText, 
  Calendar, 
  Eye, 
  Share2,
  BookOpen,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ResourceCard } from "@/components/ResourceCard";

// Mock data
const mockResourceDetail = {
  id: "1",
  title: "2024年一级建造师《建设工程经济》真题及答案",
  examName: "一级建造师",
  examSlug: "yijian",
  subject: "建设工程经济",
  resourceType: "真题",
  accessType: "免费",
  year: 2024,
  downloadCount: 3256,
  viewCount: 12580,
  fileSize: "15.6 MB",
  fileFormat: "PDF",
  isHot: true,
  isNew: true,
  pointsRequired: 10,
  description: "本资料为2024年一级建造师《建设工程经济》科目的真题试卷及详细答案解析。试题完整收录当年考试全部题目，答案由名师团队精心编写，包含解题思路和知识点归纳。",
  content: `
## 资料内容

1. **2024年考试真题完整版**
   - 单选题 60道
   - 多选题 20道
   - 案例分析题 5道

2. **详细答案解析**
   - 每题配有详细解题过程
   - 知识点标注
   - 常见错误分析

3. **考点归纳总结**
   - 本年度考试重点
   - 与往年考题对比分析
   - 未来备考建议

## 适用人群

- 2025年备考一级建造师的考生
- 需要复习真题的在职考生
- 想了解考试难度的初学者
  `,
  createdAt: "2024-09-15",
  updatedAt: "2024-09-20",
};

const mockRelatedResources = [
  { id: "2", title: "2024年一级建造师《建设工程法规》真题及答案", examName: "一级建造师", resourceType: "真题", accessType: "免费", year: 2024, downloadCount: 2890, isNew: true, slug: "yijian-fagui-2024" },
  { id: "3", title: "2024年一级建造师《项目管理》真题及答案", examName: "一级建造师", resourceType: "真题", accessType: "积分", year: 2024, downloadCount: 2560, slug: "yijian-xiangmu-2024" },
  { id: "4", title: "2023年一级建造师《建设工程经济》真题及答案", examName: "一级建造师", resourceType: "真题", accessType: "免费", year: 2023, downloadCount: 4520, slug: "yijian-jingji-2023" },
];

const ResourceDetail = () => {
  const { slug } = useParams<{ slug: string }>();

  const resource = mockResourceDetail;

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
    <div className="min-h-screen bg-background">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-muted/50 border-b border-border">
        <div className="container py-3">
          <nav className="flex items-center gap-2 text-sm flex-wrap">
            <Link to="/" className="text-muted-foreground hover:text-primary">首页</Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <Link to={`/exam/${resource.examSlug}`} className="text-muted-foreground hover:text-primary">
              {resource.examName}
            </Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground font-medium line-clamp-1">{resource.title}</span>
          </nav>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Title Section */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center text-primary flex-shrink-0">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      {resource.isNew && <span className="tag-new">新</span>}
                      {resource.isHot && <span className="tag-hot">热</span>}
                      <span className={getAccessTypeClass(resource.accessType)}>
                        {resource.accessType}
                      </span>
                    </div>
                    <h1 className="text-xl md:text-2xl font-bold text-foreground mb-3">
                      {resource.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {resource.examName}
                      </span>
                      <Badge variant="outline">{resource.resourceType}</Badge>
                      {resource.year && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {resource.year}年
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-foreground">{resource.downloadCount.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">下载次数</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{resource.viewCount.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">浏览次数</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{resource.fileSize}</div>
                    <div className="text-sm text-muted-foreground">文件大小</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{resource.fileFormat}</div>
                    <div className="text-sm text-muted-foreground">文件格式</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold text-foreground mb-4">资料简介</h2>
                <p className="text-muted-foreground leading-relaxed">{resource.description}</p>
              </CardContent>
            </Card>

            {/* Content */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold text-foreground mb-4">详细内容</h2>
                <div className="prose prose-sm max-w-none text-muted-foreground">
                  <div dangerouslySetInnerHTML={{ __html: resource.content.replace(/\n/g, '<br/>').replace(/##/g, '<h3>').replace(/\*\*/g, '<strong>') }} />
                </div>
              </CardContent>
            </Card>

            {/* Related Resources */}
            <div>
              <h2 className="section-title">相关推荐</h2>
              <div className="space-y-3">
                {mockRelatedResources.map((res) => (
                  <ResourceCard key={res.id} {...res} />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Download Card */}
            <Card className="sticky top-20">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">下载资料</h3>
                
                {resource.accessType === "免费" ? (
                  <>
                    <p className="text-sm text-muted-foreground mb-4">
                      此资料为免费资源，登录后即可下载
                    </p>
                    <Button className="w-full bg-gradient-success hover:opacity-90 mb-3">
                      <Download className="w-4 h-4 mr-2" />
                      免费下载
                    </Button>
                  </>
                ) : resource.accessType === "VIP" ? (
                  <>
                    <p className="text-sm text-muted-foreground mb-4">
                      此资料为VIP专属资源，开通VIP后可无限下载
                    </p>
                    <Button className="w-full bg-gradient-accent hover:opacity-90 mb-3">
                      <Download className="w-4 h-4 mr-2" />
                      VIP下载
                    </Button>
                    <Button variant="outline" className="w-full">
                      开通VIP会员
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground mb-4">
                      此资料需要 <strong className="text-warning">{resource.pointsRequired || 10}积分</strong> 兑换
                    </p>
                    <Button className="w-full bg-gradient-primary hover:opacity-90 mb-3">
                      <Download className="w-4 h-4 mr-2" />
                      积分兑换
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      当前积分：<strong>0</strong>，<Link to="/earn-points" className="text-primary hover:underline">获取更多积分</Link>
                    </p>
                  </>
                )}

                <Separator className="my-4" />

                <div className="flex items-center justify-between">
                  <Button variant="ghost" size="sm" className="flex-1">
                    <Eye className="w-4 h-4 mr-1" />
                    预览
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1">
                    <Share2 className="w-4 h-4 mr-1" />
                    分享
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Meta Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">资料信息</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">所属考试</span>
                    <Link to={`/exam/${resource.examSlug}`} className="text-primary hover:underline">
                      {resource.examName}
                    </Link>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">科目</span>
                    <span className="text-foreground">{resource.subject}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">资料类型</span>
                    <Badge variant="outline">{resource.resourceType}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">上传时间</span>
                    <span className="text-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {resource.createdAt}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">更新时间</span>
                    <span className="text-foreground">{resource.updatedAt}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ResourceDetail;

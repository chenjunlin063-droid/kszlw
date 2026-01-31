import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ExamCategory from "./pages/ExamCategory";
import ResourceDetail from "./pages/ResourceDetail";
import Categories from "./pages/Categories";
import SearchResults from "./pages/SearchResults";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminExams from "./pages/admin/AdminExams";
import AdminResources from "./pages/admin/AdminResources";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements";
import AdminSettings from "./pages/admin/AdminSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/category/:slug" element={<Categories />} />
            <Route path="/exam/:slug" element={<ExamCategory />} />
            <Route path="/resource/:slug" element={<ResourceDetail />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/free" element={<Index />} />
            <Route path="/hot" element={<Index />} />
            <Route path="/new" element={<Index />} />
            <Route path="/promotions" element={<Index />} />
            <Route path="/about" element={<Index />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="exams" element={<AdminExams />} />
              <Route path="resources" element={<AdminResources />} />
              <Route path="announcements" element={<AdminAnnouncements />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

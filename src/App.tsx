import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ExamCategory from "./pages/ExamCategory";
import ResourceDetail from "./pages/ResourceDetail";
import Categories from "./pages/Categories";
import SearchResults from "./pages/SearchResults";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

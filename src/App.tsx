import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ConsentBanner from "@/components/ConsentBanner";
import { bootstrapAds } from "@/lib/ads";

const queryClient = new QueryClient();

const App = () => {
  const [language] = useState<'en' | 'hi'>(
    (typeof window !== 'undefined' && (localStorage.getItem('language') as 'en' | 'hi')) || 'hi'
  );

  useEffect(() => {
    bootstrapAds();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <ConsentBanner language={language} />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

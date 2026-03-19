import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import BottomNav from "@/components/BottomNav";
import WalletProvider from "@/components/WalletProvider";
import TopBar from "@/components/TopBar";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Home from "./pages/Home";
import Build from "./pages/Build";
import Marketplace from "./pages/Marketplace";
import Library from "./pages/Library";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
    <WalletProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner richColors position="bottom-right" />
          <BrowserRouter>
            <div className="min-h-screen bg-background">
              <TopBar />
              <div className="pt-14">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/build" element={<Build />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/library" element={<Library />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              </div>
              <BottomNav />
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </WalletProvider>
  </ThemeProvider>
);

export default App;

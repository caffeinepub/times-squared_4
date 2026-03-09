import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import { ArticlePage } from "./components/ArticlePage";
import { Header } from "./components/Header";
import { HomePage } from "./components/HomePage";
import { LoginPage } from "./components/LoginPage";
import { NavDrawer } from "./components/NavDrawer";
import { PrivacyPage } from "./components/PrivacyPage";

export type Page =
  | { name: "home" }
  | { name: "article"; id: bigint }
  | { name: "privacy" }
  | { name: "login" };

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>({ name: "home" });
  const [drawerOpen, setDrawerOpen] = useState(false);

  function navigate(page: Page) {
    setCurrentPage(page);
    setDrawerOpen(false);
    window.scrollTo({ top: 0 });
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header
        onMenuClick={() => setDrawerOpen(true)}
        onLogoClick={() => navigate({ name: "home" })}
      />
      <NavDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        navigate={navigate}
        currentPage={currentPage.name}
      />
      <main>
        {currentPage.name === "home" && (
          <HomePage
            onArticleClick={(id) => navigate({ name: "article", id })}
          />
        )}
        {currentPage.name === "article" && (
          <ArticlePage
            articleId={currentPage.id}
            onBack={() => navigate({ name: "home" })}
          />
        )}
        {currentPage.name === "privacy" && <PrivacyPage />}
        {currentPage.name === "login" && (
          <LoginPage onSuccess={() => navigate({ name: "home" })} />
        )}
      </main>
      <footer className="border-t border-white/20 mt-20 py-8 px-6 text-center">
        <p className="text-xs font-sans opacity-40 tracking-widest uppercase">
          © 2026
        </p>
      </footer>
      <Toaster theme="dark" />
    </div>
  );
}

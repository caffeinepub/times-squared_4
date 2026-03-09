import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Identity } from "@icp-sdk/core/agent";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  Pencil,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Page } from "../App";
import type { Article, ViewCount } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAllArticles,
  useDeleteArticle,
  useIsCallerAdmin,
  usePublishArticle,
  useTotalViewCount,
  useUnpublishArticle,
  useViewCounts,
} from "../hooks/useQueries";
import { uploadImage } from "../utils/imageStorage";

// ─── Types ───────────────────────────────────────────────────────────────────

interface NavDrawerProps {
  open: boolean;
  onClose: () => void;
  navigate: (page: Page) => void;
  currentPage: string;
}

interface ArticleFormData {
  title: string;
  author: string;
  publicationDate: string;
  bodyContent: string;
  image1File: File | null;
  image1Preview: string | null;
  image1ExistingHash: string | null;
  image2File: File | null;
  image2Preview: string | null;
  image2ExistingHash: string | null;
}

type DrawerView = "nav" | "admin";
type AdminTab = "new" | "list" | "analytics";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function emptyForm(): ArticleFormData {
  return {
    title: "",
    author: "",
    publicationDate: todayStr(),
    bodyContent: "",
    image1File: null,
    image1Preview: null,
    image1ExistingHash: null,
    image2File: null,
    image2Preview: null,
    image2ExistingHash: null,
  };
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function NavDrawer({
  open,
  onClose,
  navigate,
  currentPage,
}: NavDrawerProps) {
  const { identity, clear } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();
  const isLoggedIn = !!identity;

  const [drawerView, setDrawerView] = useState<DrawerView>("nav");

  // Reset to nav view whenever drawer closes
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => setDrawerView("nav"), 350);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Escape key
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (drawerView === "admin") setDrawerView("nav");
        else onClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, drawerView, onClose]);

  function handleLogout() {
    clear();
    navigate({ name: "home" });
  }

  // Drawer width: wider when in admin mode
  const drawerWidth =
    drawerView === "admin" ? "w-full md:w-[520px]" : "w-[300px]";

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/70 z-40"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer shell — width animates when switching views */}
          <motion.div
            key="drawer"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={`fixed top-0 left-0 h-full bg-black border-r border-white z-50 flex flex-col ${drawerWidth} transition-all duration-300`}
            style={{ maxWidth: "100vw" }}
          >
            <AnimatePresence mode="wait">
              {drawerView === "nav" ? (
                <NavView
                  key="nav-view"
                  currentPage={currentPage}
                  isLoggedIn={isLoggedIn}
                  isAdmin={!!isAdmin}
                  onClose={onClose}
                  onNavigate={(page) => {
                    navigate(page);
                  }}
                  onOpenAdmin={() => setDrawerView("admin")}
                  onLogout={handleLogout}
                />
              ) : (
                <AdminPanelView
                  key="admin-view"
                  onBack={() => setDrawerView("nav")}
                  onLogout={handleLogout}
                />
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Nav View ────────────────────────────────────────────────────────────────

interface NavViewProps {
  currentPage: string;
  isLoggedIn: boolean;
  isAdmin: boolean;
  onClose: () => void;
  onNavigate: (page: Page) => void;
  onOpenAdmin: () => void;
  onLogout: () => void;
}

function NavView({
  currentPage,
  isLoggedIn,
  isAdmin,
  onClose,
  onNavigate,
  onOpenAdmin,
  onLogout,
}: NavViewProps) {
  return (
    <motion.nav
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col h-full"
      aria-label="Site navigation"
    >
      {/* Close button */}
      <div className="flex justify-end p-5 shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="text-white hover:opacity-60 transition-opacity focus:outline-none"
          aria-label="Close navigation"
          data-ocid="nav.close_button"
        >
          <X size={22} strokeWidth={1.5} />
        </button>
      </div>

      {/* Nav items */}
      <div className="flex-1 flex flex-col justify-center px-8 pb-16 gap-1">
        <button
          type="button"
          onClick={() => onNavigate({ name: "home" })}
          className={`font-editorial text-white text-3xl font-bold text-left py-3 hover:opacity-60 transition-opacity focus:outline-none ${currentPage === "home" ? "opacity-40" : ""}`}
          data-ocid="nav.home_link"
        >
          Home
        </button>

        <button
          type="button"
          onClick={() => onNavigate({ name: "privacy" })}
          className={`font-editorial text-white text-3xl font-bold text-left py-3 hover:opacity-60 transition-opacity focus:outline-none ${currentPage === "privacy" ? "opacity-40" : ""}`}
          data-ocid="nav.privacy_link"
        >
          Privacy Manifesto
        </button>

        {/* Divider above last item */}
        <div className="border-t border-white/80 mt-4 mb-2" />

        {/* Bottom nav item: Login, Admin, or Logout */}
        {!isLoggedIn && (
          <button
            type="button"
            onClick={() => onNavigate({ name: "login" })}
            className="font-editorial text-white text-3xl font-bold text-left py-3 hover:opacity-60 transition-opacity focus:outline-none"
            data-ocid="nav.login_link"
          >
            Login
          </button>
        )}

        {isLoggedIn && isAdmin && (
          <>
            <button
              type="button"
              onClick={onOpenAdmin}
              className="font-editorial text-white text-3xl font-bold text-left py-3 hover:opacity-60 transition-opacity focus:outline-none"
              data-ocid="nav.admin_link"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="font-editorial text-white/50 text-xl font-bold text-left py-2 hover:opacity-60 transition-opacity focus:outline-none"
              data-ocid="nav.logout_link"
            >
              Logout
            </button>
          </>
        )}

        {isLoggedIn && !isAdmin && (
          <button
            type="button"
            onClick={onLogout}
            className="font-editorial text-white text-3xl font-bold text-left py-3 hover:opacity-60 transition-opacity focus:outline-none"
            data-ocid="nav.login_link"
          >
            Logout
          </button>
        )}
      </div>
    </motion.nav>
  );
}

// ─── Admin Panel View ─────────────────────────────────────────────────────────

interface AdminPanelViewProps {
  onBack: () => void;
  onLogout: () => void;
}

function AdminPanelView({ onBack, onLogout }: AdminPanelViewProps) {
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const { data: articles, isLoading: articlesLoading } = useAllArticles();
  const publishMutation = usePublishArticle();
  const unpublishMutation = useUnpublishArticle();
  const deleteMutation = useDeleteArticle();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<AdminTab>("new");
  const [form, setForm] = useState<ArticleFormData>(emptyForm());
  const [editingId, setEditingId] = useState<bigint | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress1, setUploadProgress1] = useState<number | null>(null);
  const [uploadProgress2, setUploadProgress2] = useState<number | null>(null);

  const fileInput1Ref = useRef<HTMLInputElement>(null);
  const fileInput2Ref = useRef<HTMLInputElement>(null);

  const sortedArticles = articles
    ? [...articles].sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
    : [];

  function handleImageSelect(slot: 1 | 2) {
    (slot === 1 ? fileInput1Ref : fileInput2Ref).current?.click();
  }

  function handleFileChange(
    slot: 1 | 2,
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    if (slot === 1) {
      setForm((p) => ({ ...p, image1File: file, image1Preview: preview }));
    } else {
      setForm((p) => ({ ...p, image2File: file, image2Preview: preview }));
    }
  }

  function handleEditArticle(article: Article) {
    setEditingId(article.id);
    setForm({
      title: article.title,
      author: article.author,
      publicationDate: article.publicationDate,
      bodyContent: article.bodyContent,
      image1File: null,
      image1Preview: null,
      image1ExistingHash: article.heroImageBlobId ?? null,
      image2File: null,
      image2Preview: null,
      image2ExistingHash: article.heroImageBlobId2 ?? null,
    });
    setActiveTab("new");
  }

  function resetForm() {
    setForm(emptyForm());
    setEditingId(null);
    setUploadProgress1(null);
    setUploadProgress2(null);
  }

  async function handleSubmit(shouldPublish: boolean) {
    if (!form.title.trim() || !form.author.trim() || !form.bodyContent.trim()) {
      toast.error("Please fill in Title, Author, and Body Content.");
      return;
    }
    if (!actor || !identity) {
      toast.error("Not connected. Please refresh.");
      return;
    }

    setIsSubmitting(true);

    try {
      let hash1: string | null = form.image1ExistingHash;
      let hash2: string | null = form.image2ExistingHash;

      if (form.image1File) {
        setUploadProgress1(0);
        hash1 = await uploadImage(
          form.image1File,
          identity as Identity,
          (pct) => setUploadProgress1(pct),
        );
        setUploadProgress1(100);
      }
      if (form.image2File) {
        setUploadProgress2(0);
        hash2 = await uploadImage(
          form.image2File,
          identity as Identity,
          (pct) => setUploadProgress2(pct),
        );
        setUploadProgress2(100);
      }

      let articleId: bigint;

      if (editingId !== null) {
        const result = await actor.updateArticle(
          editingId,
          form.title,
          form.author,
          form.publicationDate,
          hash1,
          hash2,
          form.bodyContent,
        );
        if (result.__kind__ === "err") throw new Error(result.err);
        articleId = editingId;
        toast.success("Article updated.");
      } else {
        const result = await actor.createArticle(
          form.title,
          form.author,
          form.publicationDate,
          hash1,
          hash2,
          form.bodyContent,
        );
        if (result.__kind__ === "err") throw new Error(result.err);
        articleId = result.ok;
        toast.success("Article saved as draft.");
      }

      if (shouldPublish) {
        const pubResult = await actor.publishArticle(articleId);
        if (pubResult.__kind__ === "err") throw new Error(pubResult.err);
        toast.success("Article published.");
      }

      queryClient.invalidateQueries({ queryKey: ["all-articles"] });
      queryClient.invalidateQueries({ queryKey: ["published-articles"] });
      resetForm();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
      setUploadProgress1(null);
      setUploadProgress2(null);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30 }}
      transition={{ duration: 0.22 }}
      className="flex flex-col h-full overflow-hidden"
      data-ocid="nav.admin_panel"
    >
      {/* Panel header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0 border-b border-white/10">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-white/60 hover:text-white text-sm font-sans transition-colors focus:outline-none"
          data-ocid="nav.admin_back_button"
        >
          <ArrowLeft size={15} strokeWidth={1.5} />
          Back
        </button>

        <p className="font-editorial font-bold text-white text-base">Admin</p>

        <button
          type="button"
          onClick={onLogout}
          className="text-white/40 hover:text-white text-xs font-sans transition-colors focus:outline-none"
          data-ocid="admin.logout_button"
        >
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab("new")}
          className={`flex-1 py-3 text-xs font-sans tracking-widest uppercase transition-colors focus:outline-none ${
            activeTab === "new"
              ? "text-white border-b border-white"
              : "text-white/30 hover:text-white/60"
          }`}
          data-ocid="nav.admin_panel.tab"
        >
          {editingId !== null ? "Edit" : "New"}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("list")}
          className={`flex-1 py-3 text-xs font-sans tracking-widest uppercase transition-colors focus:outline-none ${
            activeTab === "list"
              ? "text-white border-b border-white"
              : "text-white/30 hover:text-white/60"
          }`}
          data-ocid="nav.admin_panel.tab"
        >
          Articles {articles ? `(${articles.length})` : ""}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("analytics")}
          className={`flex-1 py-3 text-xs font-sans tracking-widest uppercase transition-colors focus:outline-none flex items-center justify-center gap-1 ${
            activeTab === "analytics"
              ? "text-white border-b border-white"
              : "text-white/30 hover:text-white/60"
          }`}
          data-ocid="nav.admin_panel.analytics_tab"
        >
          <TrendingUp size={11} strokeWidth={1.5} />
          Views
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "new" && (
          <ArticleFormPanel
            form={form}
            setForm={setForm}
            editingId={editingId}
            isSubmitting={isSubmitting}
            uploadProgress1={uploadProgress1}
            uploadProgress2={uploadProgress2}
            fileInput1Ref={fileInput1Ref}
            fileInput2Ref={fileInput2Ref}
            onImageSelect={handleImageSelect}
            onFileChange={handleFileChange}
            onSubmit={handleSubmit}
            onReset={resetForm}
          />
        )}
        {activeTab === "list" && (
          <ArticleListPanel
            articles={sortedArticles}
            isLoading={articlesLoading}
            editingId={editingId}
            publishMutation={publishMutation}
            unpublishMutation={unpublishMutation}
            deleteMutation={deleteMutation}
            onEdit={handleEditArticle}
          />
        )}
        {activeTab === "analytics" && (
          <AnalyticsDashboard articles={sortedArticles} />
        )}
      </div>
    </motion.div>
  );
}

// ─── Analytics Dashboard ──────────────────────────────────────────────────────

interface AnalyticsDashboardProps {
  articles: Article[];
}

function AnalyticsDashboard({ articles }: AnalyticsDashboardProps) {
  const { data: viewCounts, isLoading: countsLoading } = useViewCounts();
  const { data: totalViews, isLoading: totalLoading } = useTotalViewCount();

  // Build a lookup map from articleId -> title
  const titleMap = new Map<string, string>();
  for (const a of articles) {
    titleMap.set(a.id.toString(), a.title);
  }

  // Sort view counts descending
  const sortedCounts: ViewCount[] = viewCounts
    ? [...viewCounts].sort((a, b) => Number(b.viewCount) - Number(a.viewCount))
    : [];

  const maxCount =
    sortedCounts.length > 0 ? Number(sortedCounts[0].viewCount) : 1;

  const isLoading = countsLoading || totalLoading;

  return (
    <div className="p-5 space-y-6" data-ocid="admin.analytics.panel">
      {/* Total views card */}
      <div className="border border-white/15 p-5">
        <p className="section-label text-white/40 mb-2">Total Views</p>
        {isLoading ? (
          <div
            className="h-10 w-24 bg-white/5 animate-pulse"
            data-ocid="admin.analytics.loading_state"
          />
        ) : (
          <p
            className="font-editorial font-bold text-white"
            style={{ fontSize: "clamp(2rem, 6vw, 3rem)" }}
            data-ocid="admin.analytics.total_views"
          >
            {totalViews !== undefined
              ? Number(totalViews).toLocaleString()
              : "0"}
          </p>
        )}
      </div>

      {/* Per-article breakdown */}
      <div>
        <p className="section-label text-white/40 mb-4">By Article</p>

        {isLoading && (
          <div className="space-y-3" data-ocid="admin.analytics.loading_state">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-white/5 animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && sortedCounts.length === 0 && (
          <div
            className="py-12 text-center"
            data-ocid="admin.analytics.empty_state"
          >
            <p className="font-sans text-white/25 text-xs tracking-widest uppercase">
              No views recorded yet
            </p>
          </div>
        )}

        {!isLoading && sortedCounts.length > 0 && (
          <div className="space-y-4">
            {sortedCounts.map((entry, idx) => {
              const title =
                titleMap.get(entry.articleId.toString()) ??
                `Article #${entry.articleId.toString()}`;
              const pct =
                maxCount > 0 ? (Number(entry.viewCount) / maxCount) * 100 : 0;
              return (
                <div
                  key={entry.articleId.toString()}
                  data-ocid={`admin.analytics.item.${idx + 1}`}
                >
                  <div className="flex items-baseline justify-between gap-3 mb-1.5">
                    <p
                      className="font-sans text-white/80 text-xs leading-snug truncate flex-1"
                      title={title}
                    >
                      {title}
                    </p>
                    <p className="font-sans text-white font-semibold text-sm shrink-0 tabular-nums">
                      {Number(entry.viewCount).toLocaleString()}
                    </p>
                  </div>
                  <div className="h-px bg-white/8 w-full overflow-hidden">
                    <div
                      className="h-full bg-white/60 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Article Form Panel ───────────────────────────────────────────────────────

interface ArticleFormPanelProps {
  form: ArticleFormData;
  setForm: React.Dispatch<React.SetStateAction<ArticleFormData>>;
  editingId: bigint | null;
  isSubmitting: boolean;
  uploadProgress1: number | null;
  uploadProgress2: number | null;
  fileInput1Ref: React.RefObject<HTMLInputElement | null>;
  fileInput2Ref: React.RefObject<HTMLInputElement | null>;
  onImageSelect: (slot: 1 | 2) => void;
  onFileChange: (slot: 1 | 2, e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (shouldPublish: boolean) => void;
  onReset: () => void;
}

function ArticleFormPanel({
  form,
  setForm,
  editingId,
  isSubmitting,
  uploadProgress1,
  uploadProgress2,
  fileInput1Ref,
  fileInput2Ref,
  onImageSelect,
  onFileChange,
  onSubmit,
  onReset,
}: ArticleFormPanelProps) {
  return (
    <div className="p-5 space-y-4">
      {/* Editing indicator */}
      {editingId !== null && (
        <div className="flex items-center justify-between py-2 px-3 bg-white/5 border border-white/10">
          <p className="font-sans text-white/60 text-xs truncate">
            Editing:{" "}
            <span className="text-white">{form.title || "Untitled"}</span>
          </p>
          <button
            type="button"
            onClick={onReset}
            className="font-sans text-white/30 text-xs hover:text-white/70 transition-colors focus:outline-none shrink-0 ml-3"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Title */}
      <div>
        <label htmlFor="drawer-title" className="section-label block mb-1.5">
          Title
        </label>
        <input
          id="drawer-title"
          type="text"
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          placeholder="Article headline..."
          className="w-full bg-transparent border border-white/20 focus:border-white text-white font-sans px-3 py-2.5 text-sm placeholder:text-white/20 focus:outline-none transition-colors"
          data-ocid="admin.article.title_input"
        />
      </div>

      {/* Author */}
      <div>
        <label htmlFor="drawer-author" className="section-label block mb-1.5">
          Author
        </label>
        <input
          id="drawer-author"
          type="text"
          value={form.author}
          onChange={(e) => setForm((p) => ({ ...p, author: e.target.value }))}
          placeholder="Author name..."
          className="w-full bg-transparent border border-white/20 focus:border-white text-white font-sans px-3 py-2.5 text-sm placeholder:text-white/20 focus:outline-none transition-colors"
          data-ocid="admin.article.input"
        />
      </div>

      {/* Date */}
      <div>
        <label htmlFor="drawer-date" className="section-label block mb-1.5">
          Publication Date
        </label>
        <input
          id="drawer-date"
          type="date"
          value={form.publicationDate}
          onChange={(e) =>
            setForm((p) => ({ ...p, publicationDate: e.target.value }))
          }
          className="w-full bg-transparent border border-white/20 focus:border-white text-white font-sans px-3 py-2.5 text-sm focus:outline-none transition-colors [color-scheme:dark]"
          data-ocid="admin.article.input"
        />
      </div>

      {/* Image 1 */}
      <div>
        <span className="section-label block mb-1.5">Hero Image 1</span>
        <input
          ref={fileInput1Ref}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onFileChange(1, e)}
          aria-label="Upload hero image 1"
        />
        <button
          type="button"
          onClick={() => onImageSelect(1)}
          className="w-full border border-dashed border-white/20 hover:border-white/50 py-4 text-center text-white/40 hover:text-white/70 text-sm font-sans transition-colors focus:outline-none"
          data-ocid="admin.article.upload_button"
        >
          {form.image1Preview || form.image1ExistingHash ? (
            <span className="text-white/70">Replace image 1</span>
          ) : (
            <span>+ Upload hero image 1</span>
          )}
        </button>
        {form.image1Preview && (
          <img
            src={form.image1Preview}
            alt="Hero 1 preview"
            className="mt-2 w-full object-cover"
            style={{ maxHeight: "160px", borderRadius: 0 }}
          />
        )}
        {uploadProgress1 !== null && (
          <div className="mt-1.5" data-ocid="admin.article.loading_state">
            <Progress value={uploadProgress1} className="h-0.5 bg-white/10" />
            <p className="text-white/40 text-xs mt-1">{uploadProgress1}%</p>
          </div>
        )}
        {!form.image1Preview && form.image1ExistingHash && (
          <p className="text-white/40 text-xs mt-1">Existing image retained</p>
        )}
      </div>

      {/* Image 2 */}
      <div>
        <span className="section-label block mb-1.5">
          Hero Image 2 (Optional)
        </span>
        <input
          ref={fileInput2Ref}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onFileChange(2, e)}
          aria-label="Upload hero image 2"
        />
        <button
          type="button"
          onClick={() => onImageSelect(2)}
          className="w-full border border-dashed border-white/20 hover:border-white/50 py-4 text-center text-white/40 hover:text-white/70 text-sm font-sans transition-colors focus:outline-none"
          data-ocid="admin.article.upload_button"
        >
          {form.image2Preview || form.image2ExistingHash ? (
            <span className="text-white/70">Replace image 2</span>
          ) : (
            <span>+ Upload supplementary image 2</span>
          )}
        </button>
        {form.image2Preview && (
          <img
            src={form.image2Preview}
            alt="Hero 2 preview"
            className="mt-2 w-full object-cover"
            style={{ maxHeight: "160px", borderRadius: 0 }}
          />
        )}
        {uploadProgress2 !== null && (
          <div className="mt-1.5">
            <Progress value={uploadProgress2} className="h-0.5 bg-white/10" />
            <p className="text-white/40 text-xs mt-1">{uploadProgress2}%</p>
          </div>
        )}
        {!form.image2Preview && form.image2ExistingHash && (
          <p className="text-white/40 text-xs mt-1">Existing image retained</p>
        )}
      </div>

      {/* Body */}
      <div>
        <label htmlFor="drawer-body" className="section-label block mb-1.5">
          Body Content
        </label>
        <textarea
          id="drawer-body"
          value={form.bodyContent}
          onChange={(e) =>
            setForm((p) => ({ ...p, bodyContent: e.target.value }))
          }
          placeholder="Write your article here..."
          className="w-full bg-transparent border border-white/20 focus:border-white text-white font-sans px-3 py-2.5 text-sm placeholder:text-white/20 focus:outline-none transition-colors resize-y"
          style={{ minHeight: "200px" }}
          data-ocid="admin.article.textarea"
        />
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 pt-1 pb-4">
        <button
          type="button"
          onClick={() => onSubmit(false)}
          disabled={isSubmitting}
          className="flex-1 flex items-center justify-center gap-2 border border-white/30 hover:border-white text-white font-sans text-xs py-3 px-3 transition-colors focus:outline-none disabled:opacity-40"
          data-ocid="admin.article.save_button"
        >
          {isSubmitting && <Loader2 size={12} className="animate-spin" />}
          Save as Draft
        </button>
        <button
          type="button"
          onClick={() => onSubmit(true)}
          disabled={isSubmitting}
          className="flex-1 flex items-center justify-center gap-2 bg-white text-black font-sans text-xs font-semibold py-3 px-3 hover:bg-white/90 transition-colors focus:outline-none disabled:opacity-40"
          data-ocid="admin.article.primary_button"
        >
          {isSubmitting && <Loader2 size={12} className="animate-spin" />}
          Publish
        </button>
      </div>
    </div>
  );
}

// ─── Article List Panel ───────────────────────────────────────────────────────

interface ArticleListPanelProps {
  articles: Article[];
  isLoading: boolean;
  editingId: bigint | null;
  publishMutation: ReturnType<typeof usePublishArticle>;
  unpublishMutation: ReturnType<typeof useUnpublishArticle>;
  deleteMutation: ReturnType<typeof useDeleteArticle>;
  onEdit: (article: Article) => void;
}

function ArticleListPanel({
  articles,
  isLoading,
  editingId,
  publishMutation,
  unpublishMutation,
  deleteMutation,
  onEdit,
}: ArticleListPanelProps) {
  if (isLoading) {
    return (
      <div className="p-5 space-y-3" data-ocid="admin.list.loading_state">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="p-5 py-16 text-center" data-ocid="admin.list.empty_state">
        <p className="font-sans text-white/25 text-xs tracking-widest uppercase">
          No articles yet
        </p>
      </div>
    );
  }

  return (
    <div className="p-5">
      {articles.map((article, idx) => (
        <AdminArticleRow
          key={article.id.toString()}
          article={article}
          index={idx}
          isEditing={editingId === article.id}
          onEdit={() => onEdit(article)}
          onPublish={() => publishMutation.mutate(article.id)}
          onUnpublish={() => unpublishMutation.mutate(article.id)}
          onDelete={() => {
            if (window.confirm("Delete this article permanently?")) {
              deleteMutation.mutate(article.id, {
                onSuccess: () => toast.success("Article deleted."),
                onError: (e) => toast.error(e.message),
              });
            }
          }}
          isPublishing={publishMutation.isPending}
          isUnpublishing={unpublishMutation.isPending}
          isDeleting={deleteMutation.isPending}
        />
      ))}
    </div>
  );
}

// ─── Admin Article Row ────────────────────────────────────────────────────────

interface AdminArticleRowProps {
  article: Article;
  index: number;
  isEditing: boolean;
  onEdit: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
  onDelete: () => void;
  isPublishing: boolean;
  isUnpublishing: boolean;
  isDeleting: boolean;
}

function AdminArticleRow({
  article,
  index,
  isEditing,
  onEdit,
  onPublish,
  onUnpublish,
  onDelete,
  isPublishing,
  isUnpublishing,
  isDeleting,
}: AdminArticleRowProps) {
  return (
    <div
      className={`py-4 border-b border-white/10 last:border-b-0 ${isEditing ? "bg-white/5 -mx-5 px-5" : ""}`}
      data-ocid={`admin.list.item.${index + 1}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p
            className="font-editorial font-bold text-white text-sm leading-snug truncate"
            title={article.title}
          >
            {article.title}
          </p>
          <p className="font-sans text-white/40 text-xs mt-0.5">
            {article.author} • {formatDate(article.publicationDate)}
          </p>
        </div>
        <Badge
          variant="outline"
          className={`text-xs border font-sans tracking-wider shrink-0 ${article.isPublished ? "border-white/60 text-white/80" : "border-white/20 text-white/30"}`}
          style={{ borderRadius: 0 }}
        >
          {article.isPublished ? "Live" : "Draft"}
        </Badge>
      </div>

      <div className="flex items-center gap-3 mt-2.5">
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-1 font-sans text-white/50 hover:text-white text-xs transition-colors focus:outline-none"
          data-ocid={`admin.list.edit_button.${index + 1}`}
        >
          <Pencil size={11} strokeWidth={1.5} />
          Edit
        </button>

        <button
          type="button"
          onClick={article.isPublished ? onUnpublish : onPublish}
          disabled={isPublishing || isUnpublishing}
          className="flex items-center gap-1 font-sans text-white/50 hover:text-white text-xs transition-colors focus:outline-none disabled:opacity-30"
          data-ocid={`admin.list.toggle.${index + 1}`}
        >
          {article.isPublished ? (
            <>
              <EyeOff size={11} strokeWidth={1.5} />
              Unpublish
            </>
          ) : (
            <>
              <Eye size={11} strokeWidth={1.5} />
              Publish
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onDelete}
          disabled={isDeleting}
          className="flex items-center gap-1 font-sans text-white/30 hover:text-red-400 text-xs transition-colors focus:outline-none disabled:opacity-30 ml-auto"
          data-ocid={`admin.list.delete_button.${index + 1}`}
        >
          <Trash2 size={11} strokeWidth={1.5} />
          Delete
        </button>
      </div>
    </div>
  );
}

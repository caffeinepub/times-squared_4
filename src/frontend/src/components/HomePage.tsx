import { Check, Link2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Article } from "../backend.d";
import { usePublishedArticles } from "../hooks/useQueries";
import { BlobImage } from "./BlobImage";

interface HomePageProps {
  onArticleClick: (id: bigint) => void;
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function CopyLinkButton({ articleId }: { articleId: bigint }) {
  const [copied, setCopied] = useState(false);

  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    const url = `${window.location.origin}/article/${articleId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      data-ocid="article_card.copy_link.button"
      className="inline-flex items-center gap-1.5 font-sans text-white/30 hover:text-white/70 transition-colors focus:outline-none"
      style={{ fontSize: "11px", letterSpacing: "0.08em" }}
      aria-label="Copy article link"
    >
      {copied ? (
        <>
          <Check size={11} strokeWidth={2.5} />
          <span className="uppercase tracking-widest">Copied</span>
        </>
      ) : (
        <>
          <Link2 size={11} strokeWidth={2} />
          <span className="uppercase tracking-widest">Copy link</span>
        </>
      )}
    </button>
  );
}

function ArticleCard({
  article,
  index,
  onClick,
}: { article: Article; index: number; onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="py-7 border-b border-white/20 last:border-b-0"
      data-ocid={`home.article.item.${index + 1}`}
    >
      <button
        type="button"
        className="text-left w-full group focus:outline-none"
        onClick={onClick}
      >
        <h3
          className="font-editorial font-bold text-white leading-snug group-hover:opacity-70 transition-opacity"
          style={{ fontSize: "clamp(1.2rem, 3vw, 1.5rem)" }}
        >
          {article.title}
        </h3>
        <p
          className="font-sans text-white/50 mt-2 mb-3"
          style={{ fontSize: "13px" }}
        >
          {article.author} • {formatDate(article.publicationDate)}
        </p>
        <p
          className="font-sans text-white/75 leading-relaxed"
          style={{
            fontSize: "15px",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {article.excerpt}
        </p>
      </button>
      <div className="mt-3">
        <CopyLinkButton articleId={article.id} />
      </div>
    </motion.div>
  );
}

export function HomePage({ onArticleClick }: HomePageProps) {
  const { data: articles, isLoading } = usePublishedArticles();

  const sortedArticles = articles
    ? [...articles].sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
    : [];

  const featured = sortedArticles[0] ?? null;
  const rest = sortedArticles.slice(1);

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section
        data-ocid="home.hero_section"
        className="w-full relative overflow-hidden"
      >
        {isLoading ? (
          <div
            className="w-full bg-white/5 animate-pulse"
            style={{ height: "clamp(280px, 50vw, 520px)" }}
          />
        ) : featured?.heroImageBlobId ? (
          <div
            className="relative w-full"
            style={{ height: "clamp(280px, 50vw, 520px)" }}
          >
            <BlobImage
              hash={featured.heroImageBlobId}
              alt={featured.title}
              className="w-full h-full object-cover"
              style={{ display: "block", borderRadius: 0 }}
            />
            {/* T² watermark */}
            <div
              className="absolute bottom-4 right-5 font-editorial font-black text-white/50 pointer-events-none select-none"
              style={{ fontSize: "clamp(1rem, 3vw, 1.75rem)" }}
              aria-hidden="true"
            >
              T<sup>²</sup>
            </div>
          </div>
        ) : (
          <div
            className="w-full flex items-end justify-end relative"
            style={{
              height: "clamp(280px, 50vw, 520px)",
              background: "linear-gradient(135deg, #111 0%, #000 100%)",
            }}
          >
            {/* Decorative pattern for no-image state */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, transparent, transparent 60px, rgba(255,255,255,0.15) 60px, rgba(255,255,255,0.15) 61px), repeating-linear-gradient(90deg, transparent, transparent 60px, rgba(255,255,255,0.15) 60px, rgba(255,255,255,0.15) 61px)",
              }}
            />
            <div
              className="absolute bottom-4 right-5 font-editorial font-black text-white/20 select-none"
              style={{ fontSize: "clamp(1rem, 3vw, 1.75rem)" }}
              aria-hidden="true"
            >
              T<sup>²</sup>
            </div>
          </div>
        )}
      </section>

      {/* Featured Article */}
      {featured ? (
        <section className="px-5 md:px-10 pt-8 pb-6">
          <p className="section-label mb-3">Headline of the Day</p>
          <button
            type="button"
            className="text-left w-full group focus:outline-none"
            onClick={() => onArticleClick(featured.id)}
            data-ocid="home.featured_article_link"
          >
            <h2
              className="font-editorial font-black text-white leading-tight group-hover:opacity-70 transition-opacity"
              style={{ fontSize: "clamp(2rem, 5vw, 2.8rem)" }}
            >
              {featured.title}
            </h2>
          </button>
          <p
            className="font-sans text-white/50 mt-3 mb-4"
            style={{ fontSize: "13px" }}
          >
            {featured.author} • {formatDate(featured.publicationDate)}
          </p>
          <p
            className="font-sans text-white/75 leading-relaxed"
            style={{
              fontSize: "16px",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {featured.excerpt}
          </p>
          <div className="mt-4">
            <CopyLinkButton articleId={featured.id} />
          </div>
        </section>
      ) : !isLoading ? (
        <section className="px-5 md:px-10 pt-8 pb-6">
          <p className="section-label mb-3">Headline of the Day</p>
          <h2
            className="font-editorial font-black text-white leading-tight"
            style={{ fontSize: "clamp(2.2rem, 7vw, 3.2rem)" }}
          >
            No articles published yet.
          </h2>
          <p
            className="font-sans text-white/40 mt-3"
            style={{ fontSize: "16px" }}
          >
            Check back soon for on-chain journalism.
          </p>
        </section>
      ) : null}

      {/* Divider */}
      <div className="mx-5 md:mx-10 border-t border-white" />

      {/* On-Chain Headlines section */}
      <section className="px-5 md:px-10 pt-8">
        <h2
          className="font-editorial font-bold text-white mb-6"
          style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)" }}
        >
          On-Chain Headlines
        </h2>

        {isLoading ? (
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="py-7 border-b border-white/10">
                <div className="h-6 bg-white/10 animate-pulse mb-3 w-3/4" />
                <div className="h-4 bg-white/5 animate-pulse mb-3 w-1/3" />
                <div className="h-4 bg-white/5 animate-pulse w-full" />
              </div>
            ))}
          </div>
        ) : rest.length > 0 ? (
          <div>
            {rest.map((article, idx) => (
              <ArticleCard
                key={article.id.toString()}
                article={article}
                index={idx}
                onClick={() => onArticleClick(article.id)}
              />
            ))}
          </div>
        ) : (
          <div
            className="py-16 text-center border-t border-white/10"
            data-ocid="home.article.empty_state"
          >
            <p className="font-sans text-white/30 tracking-widest uppercase text-xs">
              No additional articles
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

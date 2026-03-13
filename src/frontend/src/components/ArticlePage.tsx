import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Check, Copy, Square, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useArticleById } from "../hooks/useQueries";
import { BlobImage } from "./BlobImage";

interface ArticlePageProps {
  articleId: bigint;
  onBack: () => void;
}

const TIP_ADDRESS =
  "9243e4dba5135fe82719bdb7e690e10fce1cdf97a470ced1c64927fc4e59e6a8";

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function renderBody(body: string) {
  const paragraphs = body.split(/\n\n+/);
  return paragraphs.map((para, i) => {
    const lines = para.split(/\n/);
    const paraKey = `para-${i}-${para.slice(0, 20)}`;
    return (
      <p key={paraKey} className="mb-6 last:mb-0">
        {lines.map((line, j) => {
          const lineKey = `line-${i}-${j}`;
          return (
            <span key={lineKey}>
              {line}
              {j < lines.length - 1 && <br />}
            </span>
          );
        })}
      </p>
    );
  });
}

function TipSection() {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(TIP_ADDRESS).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="px-5 md:px-10 mt-10 mb-8" data-ocid="article.tip_section">
      {/* Divider */}
      <div className="border-t border-white/20 mb-8" />

      {/* Tagline */}
      <p
        className="font-sans text-white/50 italic mb-6"
        style={{ fontSize: "14px", letterSpacing: "0.01em" }}
      >
        This isn't a coffee shop. Nobody's watching. Only tip if you want to.
      </p>

      {/* Wallet address */}
      <div className="flex items-center gap-3">
        <span
          className="font-mono text-white/40 break-all"
          style={{ fontSize: "11px", letterSpacing: "0.04em" }}
        >
          {TIP_ADDRESS}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex-shrink-0 text-white/30 hover:text-white/70 transition-colors focus:outline-none"
          aria-label="Copy wallet address"
          data-ocid="article.tip_copy_button"
        >
          {copied ? (
            <Check size={13} strokeWidth={1.5} />
          ) : (
            <Copy size={13} strokeWidth={1.5} />
          )}
        </button>
      </div>
    </div>
  );
}

export function ArticlePage({ articleId, onBack }: ArticlePageProps) {
  const { data: article, isLoading } = useArticleById(articleId);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  function handleReadAloud() {
    if (!article) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(article.bodyContent);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  }

  return (
    <div className="relative pb-28">
      {/* Back button */}
      <div className="px-5 md:px-10 py-5">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 font-sans text-white/60 hover:text-white transition-colors focus:outline-none text-sm tracking-wide"
          data-ocid="article.back_button"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          Back
        </button>
      </div>

      {isLoading ? (
        <div className="px-5 md:px-10 space-y-4">
          <Skeleton className="h-16 w-full bg-white/10" />
          <Skeleton className="h-5 w-2/5 bg-white/5" />
          <div className="border-t border-white/20 my-6" />
          <Skeleton
            className="w-full bg-white/10"
            style={{ height: "50vw", maxHeight: "480px" }}
          />
          <div className="space-y-3 mt-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton
                key={i}
                className="h-5 bg-white/5"
                style={{ width: `${90 - i * 5}%` }}
              />
            ))}
          </div>
        </div>
      ) : !article ? (
        <div className="px-5 md:px-10 py-20 text-center">
          <p className="font-editorial text-white/40 text-xl italic">
            Article not found.
          </p>
          <button
            type="button"
            onClick={onBack}
            className="mt-6 font-sans text-white/50 text-sm underline underline-offset-4 hover:text-white transition-colors"
          >
            Return to Home
          </button>
        </div>
      ) : (
        <>
          {/* Headline */}
          <div className="px-5 md:px-10">
            <h1
              className="font-editorial font-black text-white leading-tight"
              style={{ fontSize: "clamp(2.2rem, 5vw, 3.5rem)" }}
            >
              {article.title}
            </h1>

            {/* Meta row */}
            <p
              className="font-sans text-white/50 mt-4 mb-5"
              style={{ fontSize: "13px" }}
            >
              {article.author} • {formatDate(article.publicationDate)}
            </p>

            {/* Divider */}
            <div className="border-t border-white mb-0" />
          </div>

          {/* Hero Image 1 */}
          {article.heroImageBlobId && (
            <div className="w-full mt-6">
              <BlobImage
                hash={article.heroImageBlobId}
                alt={`${article.title} hero image`}
                className="w-full object-cover"
                style={{
                  display: "block",
                  maxHeight: "520px",
                  borderRadius: 0,
                }}
              />
            </div>
          )}

          {/* Body Content */}
          <div
            className="px-5 md:px-10 mt-8 font-sans text-white/90 leading-relaxed"
            style={{ fontSize: "clamp(16px, 2.2vw, 18px)", lineHeight: 1.75 }}
          >
            {renderBody(article.bodyContent)}
          </div>

          {/* Hero Image 2 (after body) */}
          {article.heroImageBlobId2 && (
            <div className="w-full mt-10">
              <BlobImage
                hash={article.heroImageBlobId2}
                alt={`${article.title} supplementary image`}
                className="w-full object-cover"
                style={{
                  display: "block",
                  maxHeight: "520px",
                  borderRadius: 0,
                }}
              />
            </div>
          )}

          {/* Tip Section */}
          <TipSection />
        </>
      )}

      {/* Read Aloud button — fixed bottom center */}
      {!isLoading && article && (
        <div className="fixed bottom-8 left-0 right-0 flex justify-center z-30 pointer-events-none">
          <button
            type="button"
            onClick={handleReadAloud}
            className="read-aloud-btn pointer-events-auto shadow-2xl"
            data-ocid="article.read_aloud_button"
            aria-label={
              isSpeaking ? "Stop reading aloud" : "Read article aloud"
            }
          >
            {isSpeaking ? (
              <>
                <Square size={14} strokeWidth={1.5} />
                Stop
              </>
            ) : (
              <>
                <Volume2 size={14} strokeWidth={1.5} />
                Read Aloud
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

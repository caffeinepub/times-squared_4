import type { Identity } from "@icp-sdk/core/agent";
import { useEffect, useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { getImageUrl } from "../utils/imageStorage";

interface BlobImageProps {
  hash: string | null | undefined;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}

export function BlobImage({ hash, alt, className, style }: BlobImageProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { identity } = useInternetIdentity();

  useEffect(() => {
    if (!hash) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setUrl(null);

    getImageUrl(hash, identity as Identity | undefined)
      .then((resolved) => {
        if (!cancelled) {
          setUrl(resolved);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [hash, identity]);

  if (!hash) return null;

  if (loading) {
    return (
      <div
        className={`bg-white/10 animate-pulse ${className ?? ""}`}
        style={style}
        aria-label="Loading image"
      />
    );
  }

  if (!url) return null;

  return (
    <img
      src={url}
      alt={alt}
      className={className}
      style={{ ...style, borderRadius: 0 }}
      loading="lazy"
    />
  );
}

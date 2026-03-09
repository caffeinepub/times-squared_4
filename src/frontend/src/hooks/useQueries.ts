import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Article, ViewCount } from "../backend.d";
import { useActor } from "./useActor";

export function usePublishedArticles() {
  const { actor, isFetching } = useActor();
  return useQuery<Article[]>({
    queryKey: ["published-articles"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPublishedArticles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllArticles() {
  const { actor, isFetching } = useActor();
  return useQuery<Article[]>({
    queryKey: ["all-articles"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllArticles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useArticleById(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Article | null>({
    queryKey: ["article", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getArticleById(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["is-admin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useViewCounts() {
  const { actor, isFetching } = useActor();
  return useQuery<ViewCount[]>({
    queryKey: ["view-counts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getViewCounts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTotalViewCount() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["total-view-count"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getTotalViewCount();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePublishArticle() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      const result = await actor.publishArticle(id);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-articles"] });
      queryClient.invalidateQueries({ queryKey: ["published-articles"] });
    },
  });
}

export function useUnpublishArticle() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      const result = await actor.unpublishArticle(id);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-articles"] });
      queryClient.invalidateQueries({ queryKey: ["published-articles"] });
    },
  });
}

export function useDeleteArticle() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      const result = await actor.deleteArticle(id);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-articles"] });
      queryClient.invalidateQueries({ queryKey: ["published-articles"] });
    },
  });
}

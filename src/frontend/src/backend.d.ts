import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    name: string;
}
export interface Article {
    id: bigint;
    bodyContent: string;
    title: string;
    isPublished: boolean;
    createdAt: bigint;
    author: string;
    publicationDate: string;
    heroImageBlobId2?: string;
    excerpt: string;
    heroImageBlobId?: string;
}
export interface ViewCount {
    articleId: bigint;
    viewCount: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createArticle(title: string, author: string, publicationDate: string, heroImageBlobId: string | null, heroImageBlobId2: string | null, bodyContent: string): Promise<{
        __kind__: "ok";
        ok: bigint;
    } | {
        __kind__: "err";
        err: string;
    }>;
    deleteArticle(id: bigint): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getAllArticles(): Promise<Array<Article>>;
    getArticleById(id: bigint): Promise<Article | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getPublishedArticles(): Promise<Array<Article>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getTotalViewCount(): Promise<bigint>;
    getViewCounts(): Promise<Array<ViewCount>>;
    isCallerAdmin(): Promise<boolean>;
    publishArticle(id: bigint): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    recordView(id: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    unpublishArticle(id: bigint): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updateArticle(id: bigint, title: string, author: string, publicationDate: string, heroImageBlobId: string | null, heroImageBlobId2: string | null, bodyContent: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
}

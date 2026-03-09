# Times Squared

## Current State

The app is a privacy-first on-chain news publication. The admin panel lives inside the nav drawer and has two tabs: "New Article" and "All Articles". Articles are stored stably on the backend.

The backend has no view counting. The `Article` type has no view count field. There are no backend functions for recording or retrieving view counts.

The frontend `ArticlePage` does not call any view-recording function when an article is opened.

## Requested Changes (Diff)

### Add
- `stable` `viewCounts` map (`Nat -> Nat`) on the backend to store per-article view counts, keyed by article ID.
- `recordView(id: Nat)` public shared function: increments the view count for an article. No auth required (anyone can trigger it). No-ops if article doesn't exist.
- `getViewCounts()` public query function (admin-only): returns an array of `{ articleId: Nat; viewCount: Nat }` records for all articles that have at least one view.
- `getTotalViewCount()` public query function (admin-only): returns the sum of all view counts as a `Nat`.
- A third tab "Analytics" in the `AdminPanelView` in `NavDrawer.tsx`.
- An `AnalyticsDashboard` panel component inside `NavDrawer.tsx` that shows: total views across all articles, and a ranked list of per-article view counts (title + count).
- `useViewCounts` query hook in `useQueries.ts`.
- A `recordView` call in `ArticlePage.tsx` when the article loads (fires once per page load, no identity required).

### Modify
- `AdminTab` type in `NavDrawer.tsx`: add `"analytics"` as a valid tab value.
- The tabs row in `AdminPanelView`: add the Analytics tab button.
- `backend.d.ts`: add `recordView`, `getViewCounts`, `getTotalViewCount` to `backendInterface`. Add `ViewCount` type.

### Remove
- Nothing removed.

## Implementation Plan

1. Add `stable let viewCounts` map and three new functions (`recordView`, `getViewCounts`, `getTotalViewCount`) to `src/backend/main.mo`.
2. Update `src/frontend/src/backend.d.ts` with `ViewCount` interface and the three new backend method signatures.
3. Add `useViewCounts` and `useTotalViewCount` hooks to `src/frontend/src/hooks/useQueries.ts`.
4. Call `actor.recordView(articleId)` inside `ArticlePage.tsx` in a `useEffect` that runs once when the article loads.
5. Add `"analytics"` to `AdminTab` type and wire up the new Analytics tab and `AnalyticsDashboard` panel in `NavDrawer.tsx`.

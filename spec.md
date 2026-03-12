# Times Squared

## Current State
View analytics exist: `recordView` increments a `viewCounts` Map keyed by article Nat ID. The analytics dashboard queries `getViewCounts` and `getTotalViewCount` (admin only). The privacy manifesto contains the phrase "no such record is kept" which conflicts with the existence of anonymous view counts.

## Requested Changes (Diff)

### Add
- Force-refetch view counts when the analytics tab is activated in the admin panel
- A manual refresh button on the analytics dashboard

### Modify
- Backend `recordView`: remove `articles.containsKey(id)` guard; always attempt to increment, using `switch` on `viewCounts.get(id)` directly (safer, avoids silent early-return)
- `useViewCounts` and `useTotalViewCount` hooks: add `refetchOnMount: 'always'`
- Privacy manifesto: change "because no such record is kept" to "because no record of who reads what is ever kept" to accurately reflect that anonymous view counts (not linked to any reader) do exist

### Remove
- Nothing

## Implementation Plan
1. Edit `src/backend/main.mo`: remove `containsKey` check from `recordView`
2. Edit `src/frontend/src/hooks/useQueries.ts`: add `refetchOnMount: 'always'` to `useViewCounts` and `useTotalViewCount`
3. Edit `src/frontend/src/components/NavDrawer.tsx`: invalidate/refetch view count queries when analytics tab is activated; add a small refresh button
4. Edit `src/frontend/src/components/PrivacyPage.tsx`: update manifesto wording

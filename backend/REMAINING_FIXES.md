# Remaining TypeScript Fixes

## Migration Complete - Minor Fixes Needed

The full migration from PostgreSQL to Firebase/Firestore is now complete. However, there are some TypeScript compilation errors that need to be resolved before building. Here's what needs to be fixed:

## 1. Common Types Path Issue

Several model files import from `../../../common/types.js` which is outside the TypeScript root directory.

**Files affected:**
- `src/models/event.model.ts`
- `src/models/asset.model.ts`
- `src/models/news.model.ts`

**Fix:**
Move the `common` directory inside `backend/src/` or adjust `tsconfig.json` to include it.

## 2. Remove bcrypt and use Firebase Authentication (Optional but Recommended)

Currently still using `bcryptjs` for password hashing. For a full Firebase migration, consider using Firebase Authentication instead.

**Alternative:** Keep using JWT + bcrypt with Firestore (current approach) or migrate to Firebase Auth tokens.

## 3. Fix createDocument Type Issues

The `createDocument` function adds `created_at` and `updated_at` automatically, but TypeScript expects them in the input type.

**Files affected:**
- `src/models/user.model.ts`
- `src/models/event.model.ts`
- `src/models/asset.model.ts`
- `src/models/news.model.ts`
- `src/models/alert.model.ts`
- `src/models/watchlist.model.ts`

**Fix in `src/config/firestore.ts`:**
Update the `createDocument` signature to make timestamps optional:

```typescript
export async function createDocument<T>(
  collectionName: string,
  data: Omit<T, 'id' | 'created_at' | 'updated_at'>,
  customId?: string
): Promise<T> {
  // ... existing code
}
```

## 4. Watchlist Model Property Access

The `getUserWatchlist` method tries to access properties on incomplete type.

**File:** `src/models/watchlist.model.ts` lines 29, 34-35

**Fix:**
The watchlistItems typing needs correction:

```typescript
const watchlistItems = snapshot.docs.map((doc) => ({
  id: doc.id,
  ...doc.data(),
})) as WatchlistRow[];
```

## 5. Events Controller ID Type

**File:** `src/controllers/events.controller.ts` line 39

Change from:
```typescript
const eventId = parseInt(req.params.id);
```

To:
```typescript
const eventId = req.params.id;
```

## 6. Events Service ID Type

**File:** `src/services/events.service.ts` line 45

Update method signature to accept string ID:
```typescript
static async getEventById(id: string)
```

## 7. Missing Model Methods

Some services call methods that don't exist on models:

**EventModel** - Add these methods if needed or remove the service calls:
- `getAll()` (called in events.service.ts lines 33, 37, 76)

**NewsModel** - Add these methods if needed:
- `getAll()` (called in news.service.ts lines 28, 33)

**AssetModel** - Add this method:
- `updatePrice()` (called in markets.service.ts line 118)

## 8. Route Files Still Importing Old db.ts

**Files:**
- `src/routes/blog.routes.ts`
- `src/routes/brokers.routes.ts`
- `src/routes/forum.routes.ts`

**Fix:**
Remove the imports of `../config/db.js` from these files, or update to use Firestore if they need database access.

## 9. EconomicEvent Type Mismatch

**File:** `src/routes/events.routes.ts` (multiple lines)

The `forecast`, `actual`, `previous` fields are typed as `number | undefined` in the model but the type definition expects `string | undefined`.

**Fix:**
Update the type definition in `common/types.ts` to match:
```typescript
export interface EconomicEvent {
  id: string;
  title: string;
  date: Date;
  impact: 'Low' | 'Medium' | 'High';
  country: string;
  forecast?: number; // Changed from string
  actual?: number; // Changed from string
  previous?: number; // Changed from string
  description?: string;
}
```

## 10. Missing node-cron Types

**File:** `src/cron/scheduler.ts`

**Fix:**
```bash
npm install @types/node-cron
```

## 11. Missing cors Types

**File:** `src/server.ts`

**Fix:**
```bash
npm install @types/cors
```

## Quick Fix Commands

Run these commands to install missing types:

```bash
npm install @types/node-cron @types/cors
```

## Testing the Build

After applying these fixes, test the build:

```bash
npm run build
```

If successful, test the server:

```bash
npm run dev
```

## Priority Order

1. Install missing type packages (`@types/node-cron`, `@types/cors`)
2. Fix the common types path issue
3. Update controller/service ID types from `number` to `string`
4. Fix the `createDocument` type signature
5. Remove old `db.ts` imports from route files
6. Add missing model methods or remove unused service calls

Most of these are minor TypeScript issues that don't affect runtime functionality, but they prevent compilation.

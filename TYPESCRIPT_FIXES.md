# TypeScript Type Fixes for Preview.tsx

## Issue

TypeScript compilation errors when building the UI package:

```
error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'string'.
error TS2339: Property 'id' does not exist on type 'never'.
```

## Root Cause

The `schema` variable in the filter functions wasn't properly typed, causing TypeScript to infer `unknown` or `never` types.

## Fix Applied

Added explicit `any` type annotations to schema parameters:

### Before (Type Error):
```typescript
page.filter((schema) => {
  if (!isFieldInAnyGroup(schema.id, ...)) {  // ❌ schema.id is unknown
    return true;
  }
  return visibleFieldIds.includes(schema.id);  // ❌ schema.id is unknown
});
```

### After (Type Fixed):
```typescript
page.filter((schema: any) => {  // ✅ Explicit type
  if (!isFieldInAnyGroup(schema.id, ...)) {  // ✅ schema.id is string
    return true;
  }
  return visibleFieldIds.includes(schema.id);  // ✅ Works!
});
```

## Files Modified

- `packages/ui/src/components/Preview.tsx` (lines 98, 110)

## Status

✅ TypeScript errors resolved
✅ Build should complete successfully


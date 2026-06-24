/**
 * Compile-time guard (run by `tsc --noEmit` via `npm run lint`, not at runtime).
 *
 * Asserts the public expand types do NOT leak Lit's `TemplateResult` brand
 * (`_$litType$`). That brand is what caused the `[object Object]` bug across
 * duplicated `lit` instances; if it ever returns to a public type this fails
 * to compile.
 */
import type { ExpandedRowElement, RowKey, Cleanup, GetRowKey } from '../index.js';

type Assert<T extends true> = T;
type HasLitBrand<T> = T extends { _$litType$: unknown } ? true : false;

// Shapes are the expected primitives/functions.
type _Cleanup = Assert<Cleanup extends () => void ? true : false>;
type _RowKey = Assert<RowKey extends string | number ? true : false>;

// Neither callback's return value carries the Lit brand.
type _ExpandReturn = Assert<HasLitBrand<ReturnType<ExpandedRowElement>> extends false ? true : false>;
type _RowKeyReturn = Assert<HasLitBrand<ReturnType<GetRowKey>> extends false ? true : false>;

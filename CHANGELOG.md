# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## 0.2.0 (2026-06-24)


### ⚠ BREAKING CHANGES

* **react-bridge:** `expandedRowRender` prop and `ExpandedRowRenderer` type
export are removed. Migrate to `expandedRowElement` and pair
`expandable=true` with `getRowKey`.
* **reke-table:** `expandedRowRender` and the `ExpandedRowRenderer` type are
removed. Consumers migrate to `expandedRowElement(host, row, key)`. React
bridge migration lands in Slice 3.

### Features

* add react-bridge, cli skill installer and skills distribution ([636b57f](https://github.com/JReque/reke-ui/commit/636b57f1dfa5434992780d9dc138ff25bd1a4d7d))
* add reke-badge component ([e2d6dc8](https://github.com/JReque/reke-ui/commit/e2d6dc811dff77be29635731fed55ce94e2ac324))
* add reke-card component ([94add0b](https://github.com/JReque/reke-ui/commit/94add0b522d4857e5c1e7c6124256683e39a7dfc))
* add reke-checkbox component ([92408eb](https://github.com/JReque/reke-ui/commit/92408eba373d5ee04d99bad4d55db1af1d7e2c32))
* add reke-dialog component ([d54e7bc](https://github.com/JReque/reke-ui/commit/d54e7bc8ae096413b4a3738a42985804f7f2620c))
* add reke-input component ([c6494a5](https://github.com/JReque/reke-ui/commit/c6494a576c47890243868918c29b37ae2e6e9c3a))
* add reke-select component ([4fc2ead](https://github.com/JReque/reke-ui/commit/4fc2eadfd73658cfb0748fb72f91d39808038e7d))
* add reke-table component ([32e3500](https://github.com/JReque/reke-ui/commit/32e3500d95af4d1b19d5cf65894588547984086c))
* add reke-textarea component ([b4b9360](https://github.com/JReque/reke-ui/commit/b4b936099594f4db598b699fac9dfc7e6a038948))
* add reke-toggle component ([b1840a0](https://github.com/JReque/reke-ui/commit/b1840a061c8efc78cff92a1f52418ca17dcfb290))
* add reke-tooltip component ([f4e22d3](https://github.com/JReque/reke-ui/commit/f4e22d31df614bb2dcc9eeeabc1915f67fa76f61))
* integrate Tailwind CSS + Vite build + skills system ([55bbde3](https://github.com/JReque/reke-ui/commit/55bbde33a67c6c9aa79810fb2f0a79626cc16371))
* **react-bridge:** host-callback expand contract for React ([7a59153](https://github.com/JReque/reke-ui/commit/7a59153e65d05e990539eba4bef13c7db55f5dd5))
* register all component exports in index.ts and package.json ([be43f45](https://github.com/JReque/reke-ui/commit/be43f4576a198ab0f9986a88f20b0b5198ccf1e5))
* **reke-table:** host-callback expand contract ([1092b65](https://github.com/JReque/reke-ui/commit/1092b65bbb671e94679d394f9074d390bda291be))
* **reke-table:** opt-in `expandOnRowClick` for pointer-driven row toggle ([efc15e3](https://github.com/JReque/reke-ui/commit/efc15e37d6ae86a28e9589d80effaabbbaf6b647))
* **reke-table:** opt-in chevron column with ARIA + keyboard activation ([5799269](https://github.com/JReque/reke-ui/commit/5799269aece1e918e82d8daaf38717707c0b642d))
* scaffold reke-ui component library with reke-button ([aefc080](https://github.com/JReque/reke-ui/commit/aefc080105bc774d4553e9a58ad14b20a3ed391d))
* **tokens:** add global scrollbar styling with Tailwind 4.3 ([6fb6735](https://github.com/JReque/reke-ui/commit/6fb6735956e99b9492810387d5b7aa29bd4d9130))
* **tokens:** professional scrollbar design with WebKit pseudo-elements ([c233750](https://github.com/JReque/reke-ui/commit/c2337507c345f705e041d93ea28eaf34561186d8))
* **tokens:** themeable input/select control surface ([0316efb](https://github.com/JReque/reke-ui/commit/0316efb0708d8d85ea48ff11bd455121e3293b31))


### Bug Fixes

* **reke-table:** address review — orphan state purge, dev guard, cleanup safety, stable ref ([2f59569](https://github.com/JReque/reke-ui/commit/2f595698ce0f8d29f3b426e216269e25bf5e6de2))
* **reke-table:** purge phantom expanded keys on row removal (residual C1) ([c8e3c97](https://github.com/JReque/reke-ui/commit/c8e3c9730bc21a136d4a2435061c39521d690420))
* remove --provenance flag from npm publish ([4a386c0](https://github.com/JReque/reke-ui/commit/4a386c0983cc542c49c45424b067c2ee646f95f6))
* remove id-token permission to prevent auto-provenance signing ([087cee9](https://github.com/JReque/reke-ui/commit/087cee9f309bd24123e8e07d86db6c210e170a63))
* update color values for consistency across components ([cc07b16](https://github.com/JReque/reke-ui/commit/cc07b16459352f79ceb05fab2b775594c7c3907a))
* update package.json and vite.config.ts for consistent entry points ([1302d1e](https://github.com/JReque/reke-ui/commit/1302d1ea30c67e613a9e66259fc623228d84433f))

## [0.1.2](https://github.com/JReque/reke-ui/compare/v0.1.1...v0.1.2) (2026-04-20)


### Bug Fixes

* update color values for consistency across components ([cc07b16](https://github.com/JReque/reke-ui/commit/cc07b16459352f79ceb05fab2b775594c7c3907a))
* update package.json and vite.config.ts for consistent entry points ([1302d1e](https://github.com/JReque/reke-ui/commit/1302d1ea30c67e613a9e66259fc623228d84433f))

## 0.1.1 (2026-03-04)


### Features

* add reke-badge component ([3f1be77](https://github.com/JReque/reke-ui/commit/3f1be77293923bebbbf2c9cd8ac52afe47fcf8f6))
* add reke-card component ([c2278bc](https://github.com/JReque/reke-ui/commit/c2278bc9171f7d372a9043615cf9af9565cb8fc3))
* add reke-checkbox component ([36d77b3](https://github.com/JReque/reke-ui/commit/36d77b3c1a7fa479572637fa53eff3beea01768f))
* add reke-dialog component ([f683f68](https://github.com/JReque/reke-ui/commit/f683f681da7b78d1532626eedba15a80e946643c))
* add reke-input component ([89bb9df](https://github.com/JReque/reke-ui/commit/89bb9df2ad90af73c66f034310838226f5b6f353))
* add reke-select component ([a3d2afe](https://github.com/JReque/reke-ui/commit/a3d2afe4a72f4b41537b2951c2777eb6a9076cbd))
* add reke-table component ([f6ba912](https://github.com/JReque/reke-ui/commit/f6ba91287a928660e1b52128b6dccb19d0b87217))
* add reke-textarea component ([cdcaf8f](https://github.com/JReque/reke-ui/commit/cdcaf8ffe2c523514f934a591802d3fe0bfbb595))
* add reke-toggle component ([05e1d1b](https://github.com/JReque/reke-ui/commit/05e1d1bbc5a7d2c8b6e6c65b9fe8e602211d1a4c))
* add reke-tooltip component ([fc1931b](https://github.com/JReque/reke-ui/commit/fc1931bfb255ad8c3a701c337bd4eaf0f1a9b643))
* integrate Tailwind CSS + Vite build + skills system ([7fc561e](https://github.com/JReque/reke-ui/commit/7fc561ee6b5e2837248ccea7a3562c615aa21df1))
* register all component exports in index.ts and package.json ([5663d15](https://github.com/JReque/reke-ui/commit/5663d15afe2108ccd0de81c7540da87f8b6432be))
* scaffold reke-ui component library with reke-button ([2ae2749](https://github.com/JReque/reke-ui/commit/2ae2749f1a407b0bb25e90cca9fa6569063f9831))


### Bug Fixes

* remove --provenance flag from npm publish ([3e24771](https://github.com/JReque/reke-ui/commit/3e247714a83af12c0e03c49de3ea947ea8f61a28))
* remove id-token permission to prevent auto-provenance signing ([4660f1a](https://github.com/JReque/reke-ui/commit/4660f1a6d3d0bef8c26c18bd038491fee6ad7694))

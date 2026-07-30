# Changelog

All notable changes to this project will be documented in this file. Releases are managed automatically by [release-please](https://github.com/googleapis/release-please) from Conventional Commits.

## [0.4.2](https://github.com/JReque/reke-ui/compare/v0.4.1...v0.4.2) (2026-07-30)


### Bug Fixes

* **react-bridge:** align expand-collapse test helper with the new teardown ([eeae282](https://github.com/JReque/reke-ui/commit/eeae282bef0796022f3c552b520881bd35b88d0b))
* **react-bridge:** align expand-collapse test helper with the new teardown ([9c30722](https://github.com/JReque/reke-ui/commit/9c30722ee2262646d7b7a4913e890953d89e7870))

## [0.4.1](https://github.com/JReque/reke-ui/compare/v0.4.0...v0.4.1) (2026-07-30)


### Bug Fixes

* **table:** add opt-in row virtualization (F1, fixed row height) ([e3f2ae4](https://github.com/JReque/reke-ui/commit/e3f2ae4a8d9ee0b36de38b9f9b34b4abaa1fd308))
* **table:** deterministic expand teardown, no node leak, per-row rendering ([a264320](https://github.com/JReque/reke-ui/commit/a2643202112b26617d581bb3341420a437115e15))
* **table:** keep focus and scroll coherent while windowing (F3) ([48ea9bb](https://github.com/JReque/reke-ui/commit/48ea9bbf9fbd9835895b60f7f9d0ab9421846093))
* **table:** land row virtualization on develop (F1–F3, stranded by [#53](https://github.com/JReque/reke-ui/issues/53)) ([4708ef9](https://github.com/JReque/reke-ui/commit/4708ef954a4117f98ed56288dece86977611feb9))
* **table:** make expand teardown deterministic and leak-free ([d5e8d20](https://github.com/JReque/reke-ui/commit/d5e8d209389a3e6752398b28ca65e63e63b01a7b))
* **table:** measure expanded rows so virtualization and expand coexist (F2) ([250e55a](https://github.com/JReque/reke-ui/commit/250e55a0cff6e69fdd0194a8ee4bff4ed7bb6833))
* **table:** opt-in row virtualization with expandable rows ([159bddb](https://github.com/JReque/reke-ui/commit/159bddb1b540ca8cf045b8eb04a1b3326d974653))

## [0.4.0](https://github.com/JReque/reke-ui/compare/v0.3.0...v0.4.0) (2026-07-25)


### Features

* add reke-pie-chart component (ECharts pie/donut) ([#43](https://github.com/JReque/reke-ui/issues/43)) ([335a8cd](https://github.com/JReque/reke-ui/commit/335a8cdb0861afa4a561b75d5e19a9e8644802ed))
* **combobox:** add configurable multiselect mode ([#46](https://github.com/JReque/reke-ui/issues/46)) ([efce66d](https://github.com/JReque/reke-ui/commit/efce66dd7d28a5d6dee8b222f7164f72ee08fbd6))
* **combobox:** add tags mode with selection animations ([#48](https://github.com/JReque/reke-ui/issues/48)) ([cb1a41a](https://github.com/JReque/reke-ui/commit/cb1a41a92947d66bbe700c9989de747a75a8f585))
* **input,menu:** add input adornments, native attr forwarding, and reke-menu ([#44](https://github.com/JReque/reke-ui/issues/44)) ([d8dcc4c](https://github.com/JReque/reke-ui/commit/d8dcc4cf262f59e2f86038c5f83e6fda62fa4f8d))


### Bug Fixes

* **table:** stop flushSync storm and prevent focus-steal scroll jumps ([#47](https://github.com/JReque/reke-ui/issues/47)) ([bba2b09](https://github.com/JReque/reke-ui/commit/bba2b09b4139e4f7657d15654d66524cff4fbc1e))

## [0.3.0](https://github.com/JReque/reke-ui/compare/v0.2.1...v0.3.0) (2026-07-18)


### Features

* **reke-combobox:** searchable select component ([#34](https://github.com/JReque/reke-ui/issues/34)) ([46c3e08](https://github.com/JReque/reke-ui/commit/46c3e085accb275c802d99f2b3c2a67097bb58fc))


### Bug Fixes

* **reke-table:** expanded row spans full width and animates open/close ([#33](https://github.com/JReque/reke-ui/issues/33)) ([a1351da](https://github.com/JReque/reke-ui/commit/a1351dabdeed79789747514f2fc6fb28a2b1e92f))

## [0.2.1](https://github.com/JReque/reke-ui/compare/v0.2.0...v0.2.1) (2026-07-04)


### Bug Fixes

* **build:** externalize the full lit family by regex ([ea2b0e1](https://github.com/JReque/reke-ui/commit/ea2b0e1fc41991aa3b2ad10207ade5a1dbabb2f5))
* **build:** externalize the full lit family by regex ([d8b302a](https://github.com/JReque/reke-ui/commit/d8b302aea2d56efb253ee1638e8b9300f136d83f))

## [0.2.0](https://github.com/JReque/reke-ui/compare/v0.1.2...v0.2.0) (2026-06-24)


### ⚠ BREAKING CHANGES

* **react-bridge:** `expandedRowRender` prop and `ExpandedRowRenderer` type export are removed. Migrate to `expandedRowElement` and pair `expandable=true` with `getRowKey`.
* **reke-table:** `expandedRowRender` and the `ExpandedRowRenderer` type are removed. Consumers migrate to `expandedRowElement(host, row, key)`. React bridge migration lands in Slice 3.

### Features

* add react-bridge, cli skill installer and skills distribution ([636b57f](https://github.com/JReque/reke-ui/commit/636b57f1dfa5434992780d9dc138ff25bd1a4d7d))
* **react-bridge:** host-callback expand contract for React ([420df30](https://github.com/JReque/reke-ui/commit/420df30932f0c75d5aac86e13992b303f8d48c17))
* **reke-table:** complete host-callback feature into dev (Slices 2+3) ([7b2208e](https://github.com/JReque/reke-ui/commit/7b2208e8071a252f7ddb4e43e897f0da22ad18ee))
* **reke-table:** host-callback expand contract ([1092b65](https://github.com/JReque/reke-ui/commit/1092b65bbb671e94679d394f9074d390bda291be))
* **reke-table:** opt-in `expandOnRowClick` for pointer-driven row toggle ([0013396](https://github.com/JReque/reke-ui/commit/00133961978cf5f85e461b95ac52b340453bf0ef))
* **reke-table:** opt-in chevron column with ARIA + keyboard activation ([2ae4d46](https://github.com/JReque/reke-ui/commit/2ae4d4657db55feae8233838d87cbdf020b2c330))
* **tokens:** add global scrollbar styling with Tailwind 4.3 ([7b41864](https://github.com/JReque/reke-ui/commit/7b418645b2ae64b54ab49e99bd1e7df57d72e17c))
* **tokens:** professional scrollbar design with WebKit pseudo-elements ([b21b3ba](https://github.com/JReque/reke-ui/commit/b21b3bad498f403cbb6e23bf2fc03269211b77a4))
* **tokens:** themeable input/select control surface ([586ba85](https://github.com/JReque/reke-ui/commit/586ba85f949645c3cb17b2055a4cf94468d77d43))


### Bug Fixes

* **ci:** keep 0.x semantics so breaking changes bump minor not major ([#15](https://github.com/JReque/reke-ui/issues/15)) ([e1a38ca](https://github.com/JReque/reke-ui/commit/e1a38cadcdf1d0e8e277268ac1da0eca34fc0c11))
* **ci:** scope PR title lint to PRs targeting develop ([#11](https://github.com/JReque/reke-ui/issues/11)) ([c4b7bba](https://github.com/JReque/reke-ui/commit/c4b7bba494bf487996897dcf00eb198f97c56e83))
* **ci:** use v-prefixed tags without component name in release-please ([#13](https://github.com/JReque/reke-ui/issues/13)) ([dbd2ebf](https://github.com/JReque/reke-ui/commit/dbd2ebfe3c4726b16c3f2725b39c87eaaeab6626))
* **reke-chip:** a11y test on dark surface + CI test gate on PRs ([ce80f45](https://github.com/JReque/reke-ui/commit/ce80f454ee4fd7a346faa2299061f0da8229f2e6))
* **reke-chip:** test a11y contrast on the intended dark surface ([74ccdce](https://github.com/JReque/reke-ui/commit/74ccdcefb2701ed1ee8a10e22643461e756dbe7c))
* **reke-table:** address review — orphan state purge, dev guard, cleanup safety, stable ref ([0ac164d](https://github.com/JReque/reke-ui/commit/0ac164dc45bac5137d0247149bc1dcdaf5fa11a9))
* **reke-table:** purge phantom expanded keys on row removal (residual C1) ([c6d56aa](https://github.com/JReque/reke-ui/commit/c6d56aa41fbbae9ec5692831bb22269f755a2243))
* remove a dead `? false : false` ternary in reke-date-range. ([6013ec9](https://github.com/JReque/reke-ui/commit/6013ec959b048f6e061918765ef1ca80f0e4d485))

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

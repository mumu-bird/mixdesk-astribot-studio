# Third-party software

MIXDESK's optional Key Lock / pitch shifting uses unmodified SoundTouchJS 2.1.1 packages:

- `@soundtouchjs/worklet-base`
- `@soundtouchjs/core`
- `@soundtouchjs/interpolation-strategy-lanczos`

License: Mozilla Public License 2.0. Upstream: <https://github.com/cutterbl/SoundTouchJS>.
Copyright notices include Olli Parviainen, Ryan Berdeen, Jakub Fiala and Steve 'Cutter' Blades; see each package's source files and included notices for exact attribution.

Exact dependency versions and integrity hashes are pinned in `package-lock.json`. Original package source is available from the upstream repository and the corresponding npm 2.1.1 packages. This project does not modify those library source files. `src/pitch-worklet.js` is an independent adapter that adds processor lifecycle control. License texts ship in `public/third-party/` and are copied into `dist/third-party/` by the build.

Vite and Playwright are development tools and are not embedded in the audio application runtime. Their licenses remain in `node_modules` and their package metadata.

DJUCED's application binary and its third-party audio libraries are not included in MIXDESK. Local protocol observations and the inspection report are research materials, separate from implementation code.

## Metadata reader

Local tag and artwork extraction uses unmodified music-metadata and its dependency graph. Exact versions are pinned in package-lock.json; parser code is loaded locally on demand. License texts are bundled in public/third-party and copied to dist/third-party.

- `music-metadata@12.2.3` — MIT; license bundled.
- `@borewit/text-codec@0.2.2` — MIT; license bundled.
- `@tokenizer/token@0.3.0` — MIT; TypeScript-only definitions, not included in the browser runtime.
- `content-type@3.1.1` — MIT; license bundled.
- `debug@4.4.3` — MIT; license bundled.
- `ms@2.1.3` — MIT; license bundled.
- `file-type@22.2.0` — MIT; license bundled.
- `@tokenizer/inflate@0.5.1` — MIT; license bundled.
- `token-types@6.1.2` — MIT; license bundled.
- `ieee754@1.2.1` — BSD-3-Clause; license bundled.
- `strtok3@10.6.2` — MIT; license bundled.
- `uint8array-extras@1.6.0` — MIT; license bundled.
- `media-typer@2.0.0` — MIT; license bundled.
- `win-guid@0.2.1` — MIT; license bundled.

## MP3 encoder

MP3 export uses unmodified `lamejs@1.2.1` in the browser.

- `lamejs@1.2.1` — LGPL-3.0; license is included in the package and the source remains unmodified.

## DJUCED sample-pack archive writer

DJZ export uses unmodified `7z-wasm@1.2.0` (7-Zip 24.09), loaded locally in a disposable Web Worker. The original DJUCED executable is not shipped or called by the web application.

- 7-Zip: Copyright Igor Pavlov; LGPL-2.1-or-later with the unRAR restriction described in the bundled license.
- JavaScript/WASM build and build scripts: <https://github.com/use-strict/7z-wasm>, release 1.2.0; original 7-Zip source: <https://www.7-zip.org/a/7z2409-src.tar.xz>.
- Exact npm package and integrity are recorded in `package-lock.json`. Library code is unmodified; `src/djz-worker.js` is an independent adapter. The build packages WASM separately. Replacing the dependency and rebuilding with `npm run build` relinks the adapter.
- Licenses are distributed as `third-party/7z-wasm-License.txt`, `third-party/7z-wasm-unRarLicense.txt`, and `third-party/LGPL-2.1.txt`.
- `readline-sync`, a transitive dependency, is used by the package CLI only and is not included in the browser runtime.

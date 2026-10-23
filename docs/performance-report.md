# Performance and resource delivery report

Release: 20261023-domain. Date: 23 October 2026. Comparison: 20261022-content.

## Measured file changes

Measurements below are local file bytes. Compressed CSS/JavaScript is the sum of per-file gzip level 9 sizes, measured with the same Node tooling before and after. It is not a server/network measurement.

| Resource | Before | Updated | Reduction |
| --- | ---: | ---: | ---: |
| Homepage initial CSS/JS, gzip bytes | 22,897 | 17,076 | 25.4% |
| Homepage initial CSS/JS file count | 10 | 7 | 3 optional controllers omitted |
| Default eight gallery thumbnails, bytes | 1,058,786 | 329,548 | 68.9% |
| Eight larger 640 px thumbnail alternatives, bytes | 1,058,786 | 511,302 | 51.7% |
| Largest sunset hero, bytes | 484,282 | 368,410 | 23.9% |
| Obsolete homepage hero preload, bytes | 258,854 | 0 | Removed from the homepage |

The old preload referred to `hero-1920.webp`, while the homepage actually displays the supplied sunset image. Its article illustration assets remain available where used; only the unrelated preload was removed.

The sunset sources are 640 px / 84,474 bytes, 960 px / 177,196 bytes, and 1536 px / 368,410 bytes. Mobile picture candidates stop at 960 px; the normal responsive `img` includes the larger desktop source. The image remains in initial HTML and high priority, without lazy loading or an entrance delay on the heading/actions. Browser observations at DPR 1 confirmed 640 px on narrow screens, 960 px at 768 px, and the larger source where selected on desktop.

The four mine pages and processing plant load only the local features they use. Anzac's initial CSS/JS is 21,533 gzip bytes. The maximum current per-page CSS/JS is 26,308 gzip bytes, on Contact, which requires form and map controllers.

## Quality and budget choices

Every default 480 px thumbnail is below 80 KiB. The optional 640 px mineral-samples and surface-excavation thumbnails are 101,614 and 92,808 bytes. They exceed the preferred 80 KiB thumbnail budget to retain detailed texture. Full-size views retain their own image assets and load when activated. CSS, the image manifest and the browser choose an appropriate thumbnail; eight full-resolution images are not eagerly requested by the gallery controller.

Source gallery photographs were mechanically resized/encoded. The small gallery crops match the existing 4:3 object-fit frame and 25% vertical focal point. Large image links retain the complete composition. No scene content was added. The release ZIP can be larger because it includes additional responsive choices and developer evidence; visitors request the selected page resources.

There are no runtime fonts, frameworks, animation CDNs, analytics collectors or background form submissions. Maps remain explicit searches with no automatic Google embed. Five shared scripts serve every page; optional controllers are added only to the appropriate pages.

## Caching and hosting

CSS/JavaScript uses release token `20261022-verbatim` with revalidation. HTML explicitly revalidates. Other assets retain a one-hour cache policy. Long immutable caching is deliberately not used for image paths whose content may change under the same filename. Host-provided compression, HTTP caching, HTTPS and CSP enforcement require verification on the selected production host; this package does not configure them from JavaScript.

## Measurement limits

The 512 browser width checks establish rendering observations in Chrome 155 iframe viewports. They do not measure Lighthouse, real-user LCP/INP/CLS, constrained-network cold/warm loading, high-DPR image selection or physical-phone responsiveness. Targets remain LCP ≤ 2.5 s, INP ≤ 200 ms and CLS ≤ 0.1 at the 75th percentile of real-user visits, segmented by mobile and desktop.

`asset-sizes.json` contains the full per-page inventory and comparison. Run `node scripts/audit-assets.cjs` to regenerate current file-size evidence. The report uses `performance-baseline.json` unless a different unpacked baseline is supplied with `--baseline-dir`.

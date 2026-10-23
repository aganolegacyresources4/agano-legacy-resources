# Testing and release report

Date: 23 October 2026. Release: 20261023-domain. Previous release: 20261022-verbatim.

## Automated checks

`node --test qa/*.test.cjs` passed all 112 checks with no failures or skips using Node.js v24.19.0. Node is a developer tool; the website runtime is pure HTML5, CSS3 and vanilla JavaScript.

Coverage: 13 content, 10 page/file, 17 maps, 18 forms/routing, 24 interaction, 14 navigation, 7 performance/palette 5 exact-copy/viewport and 4 production-origin checks. Controlled DOM fixtures verify logic; they are not a browser emulator.

| Check | Result |
| --- | --- |
| Pages | 32 complete linked HTML pages; one main/h1 and unique titles/IDs |
| Local references | 2,255 file/fragment references; zero broken targets |
| Supplied wording | Every supplied passage and heading compared against verbatim-content.json; complete passages present on the homepage and matching linked pages |
| Original text | Spelling, grammar, punctuation, original units and geographic wording preserved; HTML escaping and paragraph whitespace allowed |
| Images | Eight supplied gallery views; valid responsive derivatives and real image-link fallbacks |
| Navigation | Semantic immediate state, rapid input, Escape/Tab, resize focus, legacy media listener and page-cache handling |
| Gallery | Loading/errors/stale callbacks; native close/focus; unsupported/failed native dialog image-link fallbacks |
| Forms | Bounded validation, consent, fixed WhatsApp recipient, encoding, exact preview, stale-link invalidation and clipboard fallback |
| Maps | Six search-only locations; no invented pins or automatic Google iframe |
| Security | Structured-data CSP hashes still covered; no credentials, unsafe-inline/eval or broadened connections |
| Performance | File budgets, responsive hero, small thumbnails, conditional feature scripts and contrast checks passed |
| Zoom | All viewport declarations allow zoom and opt into safe-area treatment |

The latest message did not supply a replacement Anzac block; its existing profile remains. The original ambiguous shaft percentage has not been converted into a depth or grade. No resource/reserve estimate or independent certification was added.

## Production origin verification — 23 October 2026

233 origin references across 32 HTML pages, robots and sitemap were changed to `https://www.aganolegacyresources.co.zw`. Every canonical URL and Open Graph page URL matches the retained path on that origin; all social images and website structured-data references use it. The sitemap still lists exactly 31 content URLs. All four distinct structured-data CSP hashes were recalculated. The obsolete external framing permission was removed; the website now permits only self-framing.

The recovered prior package and working source were byte-compared before editing. After editing, all visible body content and runtime assets matched the prior package, allowing only the requested origin replacement. Exact-copy comparisons and all local-link checks passed. No new browser run was needed for this metadata/header change. Domain registration, DNS routing, HTTPS certificates, redirects and hosted response headers were not changed or verified.

## Browser observations from the previous content release — 22 October 2026

Chrome 155.0.0.0, Linux, DPR 1, through the managed local preview. All 32 real pages rendered in same-origin iframe viewports at 320, 375, 390, 393, 402, 414, 430, 440, 480, 768, 1024, 1100, 1101, 1280, 1440 and 1920 CSS px: 512 page/width checks passed with no horizontal document overflow. Each page also passed mobile menu open/close. Widths are window.innerWidth; scrollbars reduce document.clientWidth. Standard frame heights were 720 px through 768 px width and 900 px above that.

Additional observations from that content release:

- Twenty additional pointer menu cycles at 430 px with synthetic portrait insets, ending collapsed.
- Synthetic portrait top/bottom insets of 47/34 px: header and menu spacing, Arrow Down into Company, nested Escape and focus return passed.
- Synthetic 874 × 320 landscape with left/right/bottom insets of 59/59/21 px: 59 px header gutters, final Contact AGANO link reachable and Tab exit closed the menu.
- Gallery in that short landscape frame: first image loaded, Next advanced to image 2 of 8, close dismissed immediately and focus returned to the thumbnail.
- Corporate form review font computed as 16 px at 430 px width. Synthetic .test entries produced a reviewed URL for https://wa.me/263780948702; editing removed the old URL and hid the stale preview.
- Rendered homepage showed all 16 marked supplied text/heading blocks. Desktop homepage was visually inspected.

No external WhatsApp handoff or message was sent. A repeated-click batch initially exceeded the test runtime limit; the explicit 20-cycle check subsequently completed in two bounded batches. This was not recorded as an application failure.

Earlier UX-release browser observations (resize focus, filtering, all three form previews and blank-form errors) remain separately recorded in browser-checks.json. They are not represented as new cross-browser runs.

## Browser/device limits

Only Chrome was available. Synthetic safe areas are CSS spacing checks, not iPhone or Safari emulation. Safari, Firefox, Edge, real iOS/Android touch hardware, software keyboards, high-DPR/low-memory devices, VoiceOver/NVDA/TalkBack, browser zoom/forced-colours/print/JavaScript-disabled UI runs remain outstanding. See browser-compatibility.md for the acceptance matrix and next tests.

No Lighthouse or controlled throttled-network benchmark was run. File bytes are not measured load time or field Core Web Vitals. Production TLS, actual response headers, 404 handling, exact Google pins/keys, WhatsApp delivery, domain/DNS, indexing and analytics configuration remain unverified. No production deployment or hosting-access change was made. No unconditional all-browser, WCAG, security-certification or production-readiness claim is made.

## Package verification

The flattened package is checked with the same suite. ZIP CRC, unique/safe paths, public file equality and the SHA-256 manifest are verified during packaging. index.html is at the archive root. The temporary __qa preview files are removed; reusable developer checks and handover remain included. No installation or build is required to open the website.

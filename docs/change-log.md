# Release 20261023-domain — 23 October 2026

Production canonical origin set to https://www.aganolegacyresources.co.zw across all 32 HTML pages, Open Graph metadata, structured data, robots and sitemap. Previous preview-host links were removed. Recalculated all four structured-data security hashes and removed the obsolete external framing allowance. All visible page copy and runtime assets were preserved byte-for-byte, except any specifically requested origin substitution. No domain, DNS, TLS or hosted deployment was changed.

Validation: 112 source/logic checks, including four domain consistency regressions. Previous browser layout observations remain dated to the content release; this metadata/header update does not represent a new device run.

# Release 20261022-verbatim — 22 October 2026

The complete latest supplied company passages now appear unchanged on the homepage and matching linked pages. No grammar, spelling, units, punctuation or geographic references in those passages were silently revised. The supplied text and exact-copy checks are included for handover. The homepage prioritises those passages over earlier editorial summaries.

Mobile compatibility work adds viewport-fit safe-area spacing, header/footer and fixed-control clearance, dynamic viewport height with vh fallbacks, a closed-dialog fallback and 16 px mobile message-review text. The navigation controller remains single-path and uses native controls; no touch-only dependency, body scroll lock or animation-dependent dismissal was added.

Validation: 108 automated tests, 32 pages at 16 Chrome iframe widths (512 checks), menu activation on every page, 20 further menu cycles, synthetic portrait/landscape spacing, keyboard navigation, gallery controls and corporate preview/edit handling. Safari, Edge, Firefox and physical phones remain untested. No deployment or external message was made.

# Release 20261022-ux — 22 October 2026

AGANO’s brand palette, responsive page delivery and mobile navigation have been updated across all 32 linked pages. Company copy, four mine names, contacts, office hours, processing facts, URLs and enquiry identifiers are retained.

## Visitor-facing changes

- Visible Menu wording and a hamburger/cross control, immediate expanded/hidden state, short-screen scrolling and predictable focus across desktop/mobile changes.
- Native navigation lists, larger readable mobile fields, clear focus and stronger text/control contrast.
- No hero text entrance delay; the original page content remains immediately available.
- Responsive content images and separately optimised gallery thumbnails; original full-size views still open on demand.
- Gallery closes immediately, restores focus and ignores stale image callbacks.
- New forms start at zero characters; editing invalidates the old WhatsApp review.

## Engineering changes

- Removed an unused hero preload and unused lightbox markup from 31 pages.
- Navigation starts before optional features; page-specific gallery, filter, form and maps scripts are loaded only where required.
- Kept restrictive security boundaries, explicit external handoffs and Google searches without automatic map loading.
- Added navigation, file-budget, palette and initial-state regressions. Updated image manifests, baseline/current byte reports, browser coverage and technical handover.
- Preserved five shared classic scripts and a buildless HTML/CSS/JavaScript production runtime. Developer scripts are optional.

## Validation

100 automated checks; 32 pages across ten Chrome iframe widths; repeated menu activation, keyboard/resize/short-screen navigation, gallery, filter and three exact WhatsApp previews. Detailed limits and hosting work are in `testing-report.md`. The update is packaged locally and has not been deployed.

# Company content and brand edition

Release: 20261022-verbatim. Information supplied 22 October 2026.

## Latest instruction: preserve supplied wording

The client explicitly requested the latest message be used as written, without invented wording. `verbatim-content.json` is the authoritative prose record for this release. The homepage contains every supplied passage and heading. The linked About, Operations, Minerals, LonRho, Pagamesa, Sherwood and processing pages contain their matching complete passages. Data attributes identify these blocks for copy-regression checks; the website still serves ordinary static HTML and does not fetch this document.

Preserve Pagemesa within the corporate paragraph, Pagamesa in its specific mine description, the corporate Great Dyke reference and the detailed Sherwood greenstone-belt description as separately supplied. Do not silently reconcile them, alter units, change grammar, replace hyphens, or turn stated ambitions into extra certifications. Layout may introduce paragraph breaks without changing the words. Existing short navigation labels and the unchanged Anzac profile remain available.

This instruction supersedes earlier editorial normalisation of the quoted passages. Update both the authorised source record and affected HTML only when the client supplies a revision; do not change the reference merely to make a failing test pass.

## Content included

The homepage, company story, minerals, mine portfolio, operations, technical pages and responsibility pages now use the supplied AGANO material. The full Our Story narrative is at `about.html#our-story`. Homepage highlights use the supplied 300-person mining/metallurgical team, four mines, two core minerals and one processing facility. These are company-supplied descriptions, not an audited workforce statement or a mineral-resource disclosure.

| Current public name | Preserved page | Enquiry slug |
|---|---|---|
| LonRho Gold & Antimony Mine | `sites/globe-and-phoenix.html` | `globe-and-phoenix` |
| Anzac Antimony Mine | `sites/sebakwe.html` | `sebakwe` |
| Sherwood Block Gold Mine | `sites/sherwood.html` | `sherwood` |
| Pagamesa Antimony Mine | `sites/silobela.html` | `silobela` |

Pagamesa appears fourth, following the user’s correction. The previous URLs are retained so existing inbound links and allowlisted enquiry context continue to work. Display names are updated throughout the visible site. Use **Pagamesa** for existing navigation names; preserve **Pagemesa** where it occurs in the verbatim corporate paragraph.

The plant has a dedicated `processing.html` page and is not counted as a fifth mine. Its stated feed sources are Pagamesa, Anzac and LonRho. Its supplied sequence is gravity concentration → alkaline leaching → electrowinning → smelting. No capacity, purity, recovery percentage or commissioning milestone was added.

## Technical wording decisions

- LonRho: supplied average gold grade of 10 g/t, antimony grades of 35–45% Sb, and Level 2 workings at 44 m. The page identifies these as company-supplied operational information and provides a route to supporting technical documents.
- Anzac: the 18 m minor-reef intersection and intended 60 m Jojo target are retained. The ambiguous phrase “shaft at 25%” is omitted; it has not been silently turned into 25 m depth or a 25% grade.
- Pagamesa: three operating shafts and the Fortuna, Pagamesa and Gothic reef network are retained. The supplied “up to 28% stibnite” is labelled as stibnite content, not elemental Sb grade.
- Sherwood Block: the latest detailed Midlands greenstone belt/Sherwood Deformation Zone description is used. Underground development and open-cast mining are described without adding production figures.
- Statements about becoming a leading antimony producer/processor and strengthening international-standard practices remain ambitions. No market ranking, certification, regulatory approval or completed compliance programme is invented.
- RIFA remains a historical reference; no unsupplied legal expansion, succession date or corporate registration detail is added.

The fact record and editorial decisions are in `company-information.json`. Update that record and the affected HTML when company facts change. No mine grade is published as a mineral resource/reserve estimate.

## Hours and contacts

1, Ward 8, Sebakwe Bloke, Kwekwe, Zimbabwe. Telephone/WhatsApp: +263 78 094 8702. Email: info@aganolegacyresources.co.zw.

Office hours use Africa/Harare time, shown as CAT (UTC+2): Monday–Thursday 08:00–18:00; Friday 08:00–16:00; Sunday 09:00–13:00. Saturday was not supplied and is not labelled closed. Maintain the Contact page, footer fallbacks, public configuration and Organisation contact-hours structured data together.

## Images and logo

The eight supplied gallery views include the original Anzac headgear view and the seven subsequent uploads. Local WebP derivatives now provide 480/640-pixel gallery thumbnails and appropriately sized content images. Thumbnail crops reproduce the gallery’s existing 4:3 framing and 25% vertical focal position; full-size image links preserve the whole composition. No subjects or operational features were added during asset preparation. The collection includes imagery supplied after digital enhancement; do not use it as proof of mineral grade, site measurements or equipment specifications. Only Anzac was explicitly identified by the user; other image captions remain descriptive instead of assigning a mine by appearance.

`company-image-manifest.json` records source filenames, hashes, captions, alt text and derivative dimensions. `image-provenance.json` retains the separate provenance of earlier illustrative assets used with the editorial articles. Do not replace one image category's attribution with the other's.

The brand folder includes the supplied logo reference, enhanced 1536 × 1024 transparent PNG master and smaller transparent WebP variants for page headers/footers. The favicon is derived from the emblem. `logo-provenance.json` and `logo-enhancement-prompt.txt` record the enhancement. It is a raster master; a true vector master has not been supplied.

## Ongoing maintenance

Edit the static HTML directly. The website has no mandatory content-generation script, framework or server build. Preserve image dimensions, meaningful alt text, relative paths and the gallery's real image-link fallbacks. New gallery entries need a large-image `href`, `data-lightbox`, `data-caption`, an accessible link name and a lazy-loaded thumbnail.

Keep the four-entry `AGANO_CONFIG.sites` string map compatible with form prefilling. Map configuration remains separate, with four mines, one office and one processing facility. Exact visitor pins are still unverified; follow `../MAPS_SETUP.md` before enabling an embed or directions destination.

Run `node --test qa/*.test.cjs` after changes. The development checks support both repository `dist/` and flattened ZIP layouts. Node is not needed to open the website. Source/fixture checks and the documented Chrome responsive/interaction checks passed. Actual device, screen-reader, other-browser, live Google/WhatsApp and hosted-header checks remain documented in `testing-report.md`.

## UX and performance maintenance

The four representative brand colours and accessible supporting colours live at the top of `assets/css/main.css`. Do not use light gold or steel blue for small text on ivory without a measured contrast check. Logo sizing is 120 px on mobile and 144 px on desktop; footer variants remain independently sized.

The main menu is non-modal. `navigation.js` sets `hidden`, `aria-expanded` and its visual open class together. Do not add a second click/touch handler or implement close through an animation callback. Keep the CSS and `matchMedia` breakpoint at 1100/1101 px together. Static HTML navigation remains visible before successful enhancement; keep the initially hidden trigger and complete link lists.

Include optional scripts only where their features exist. Gallery pages need the lightbox dialog and gallery controller; the other pages do not. Every new image needs correct dimensions, actual responsive size candidates and a useful description. Do not restore the obsolete hero preload. Keep empty form textareas as `<textarea ...></textarea>` so formatting whitespace is not counted as input.

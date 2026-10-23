# AGANO Legacy Resources — supplied wording and mobile compatibility edition

Release: 20261023-domain. Updated 23 October 2026.

32 linked HTML pages, four mine profiles, a dedicated antimony processing page, eight supplied gallery views and three WhatsApp enquiry forms. The website runs entirely in HTML5, CSS3 and vanilla JavaScript. It has no mandatory framework, package installation, database, server runtime or build step.

## Open and edit

Extract the whole ZIP, then open `index.html`. Keep the folders together. Open the extracted folder in Visual Studio Code for editing. Web files are at the distribution root; the original repository keeps them in `dist/`.

Pages contain their full copy, navigation, metadata and contact fallbacks. Native disclosures and image links work without JavaScript. WhatsApp message preparation requires JavaScript; the forms retain a direct WhatsApp/email alternative when it is unavailable.

## Exact supplied wording

The latest supplied company overview, full story, minerals narrative, LonRho/Pagamesa/Sherwood descriptions and processing-plant description appear unchanged on the homepage. Matching passages appear on About, Operations, Minerals and the linked mine/plant pages. `docs/verbatim-content.json` retains the supplied words and headings. Five dedicated checks compare the rendered-copy text against that source, allowing only HTML escaping and paragraph whitespace.

The spelling Pagemesa in the corporate paragraph, Pagamesa in its mine description, Great Dyke reference, original punctuation and original units have deliberately not been silently corrected. The latest message did not supply a new Anzac block; its existing linked profile remains. Existing navigation, utility labels and other unaffected pages remain in place.

Safe-area gutters, header/footer spacing, viewport-height fallbacks and 16 px mobile review text have also been added. See `docs/browser-compatibility.md` for intended browser coverage and the real-device checks still outstanding.

## UX and performance update

- Ivory `#FAF7F0`, charcoal `#33383B`, gold `#D1B485` and steel blue `#809AA8` integrated through configurable CSS tokens. Darker supporting tokens keep small text, input boundaries and focus indicators readable.
- A visible Menu label and animated hamburger/cross. One controller synchronises hidden content and expanded state, with nested Escape handling, no focus trap or scroll lock, and focus recovery at the 1100/1101 px breakpoint.
- Navigation starts from its small deferred script before optional feature scripts. Five shared scripts replace eight; forms, filters, gallery and maps load only on pages that use them.
- An obsolete hero preload removed. The sunset hero uses 640/960/1536 px sources with early discovery and high priority. The hero heading and actions no longer wait for an entrance animation.
- Dedicated 480/640 px gallery thumbnails replace full-composition portrait downloads in thumbnail slots. Full-size views still open on demand. Empty lightbox markup removed from the other 31 pages.
- Immediate gallery dismissal, so an unfinished animation cannot delay close or focus return. Empty form textareas begin at zero characters.
- Native nested lists, 16 px mobile form controls, constrained grid tracks, short-screen panel scrolling, safe-area spacing and forced-colours focus treatment.

See `docs/performance-report.md`, `docs/testing-report.md`, `docs/browser-checks.json` and `docs/ux-effects.md` for measured file sizes and verification boundaries.

## Company content included

- The full supplied company story, including the journey from RIFA, resilience, Zimbabwean capability, stewardship and generational purpose.
- A company overview built around the supplied 300-person mining/metallurgical team and four-mine operating network.
- Antimony-first origins, gold interests and the stated priorities for throughput, differential technologies and metallurgical recovery.
- Detailed profiles for LonRho, Anzac, Sherwood Block and Pagamesa, with carefully labelled operational figures and development targets.
- `processing.html`, connecting the Sebakwe facility to Pagamesa, Anzac and LonRho and presenting the supplied four-stage processing route.
- The supplied logo, enhanced transparent raster master, responsive header/footer variants and brand-derived browser icons.
- Eight gallery views: the original Anzac headgear image plus the seven subsequent uploads. Images have responsive local WebP derivatives, descriptions, captions and working enlargement controls.
- Office hours on the Contact page, footer fallbacks and Organisation contact-hours structured data.
- Current mine names in navigation, portfolio cards, location searches and allowlisted enquiry prefills.
- Existing reduced-motion effects, native gallery dialog, mobile navigation, filters, form error summaries, message review, clipboard feedback and utility controls.

Read `docs/content-handover.md` for content decisions and `docs/company-information.json` for the source facts. This release also applies the supplied brand palette and the UX/performance specification in `docs/ux-performance-update-specification.md`.

## Mines and retained URLs

| Public mine name | Existing linked page |
|---|---|
| LonRho Gold & Antimony Mine | `sites/globe-and-phoenix.html` |
| Anzac Antimony Mine | `sites/sebakwe.html` |
| Sherwood Block Gold Mine | `sites/sherwood.html` |
| Pagamesa Antimony Mine | `sites/silobela.html` |

Pagamesa appears fourth. Existing URLs and enquiry slugs are preserved so previous links continue to work. The new names replace the earlier broad portfolio labels. The processing plant is a separate facility and is not counted as a fifth mine.

The ambiguous Anzac phrase “shaft at 25%” is omitted. The supplied 18 m intersection and 60 m target remain distinct. LonRho's 10 g/t and 35–45% Sb figures are reported as supplied operational information. Pagamesa's up-to-28% figure remains stibnite content. No resource/reserve estimate, plant capacity, recovery percentage, certification, executive identity or assay source is invented.

## Contacts and hours

Head office: Room 10, Tauro Tragus Building, Kwekwe, Zimbabwe. Telephone/WhatsApp: +263 78 094 8702. Email: info@aganolegacyresources.co.zw.

Office hours, Africa/Harare time (CAT, UTC+2): Monday–Thursday 08:00–18:00; Friday 08:00–16:00; Sunday 09:00–13:00. Saturday hours were not supplied and the site does not label Saturday closed.

Maintain the contact HTML, shared footer fallbacks, `assets/js/site-config.js` and Organisation JSON-LD together. If JSON-LD changes, recalculate its exact CSP hashes.

## Maps

There are six location components: four mines, the office and the processing facility. They provide clearly labelled Google Maps name/address searches and contact fallbacks. Exact visitor pins are still unverified, so no exact directions destination or embedded map is currently enabled.

The optional verified-embed implementation includes safe URL handling, explicit activation, stable dimensions, iframe titles, qualified load/error feedback and removal with focus return. Google resources do not load automatically. Read `MAPS_SETUP.md` and `docs/location-verification.md` before configuring a genuine verified embed or restricted Maps Embed browser key.

## WhatsApp enquiries

Corporate, supplier and career forms validate bounded plain-text fields locally, show the exact message and link to the supplied AGANO number. The visitor opens WhatsApp, reviews the message and presses Send there. The website does not send automatically, confirm delivery, run a message database or provide an email submission backend.

Editing invalidates an earlier preview and handoff link. Copy feedback follows the actual clipboard operation; unavailable clipboard access provides a manual alternative. Long encoded messages retain the full text with explicit copy/paste instructions. There are no file uploads or stored message drafts.

Keep confidential documents, CVs, identification, banking details and sensitive coordinates out of initial enquiries. Local validation does not constitute server-side authentication, rate limiting or secure submission processing. WhatsApp account registration and real-device delivery were not verified.

## Maintain the source

- Edit static copy, gallery entries and links in the HTML pages.
- Use `assets/css/main.css` for design tokens and base layout, and `assets/css/effects.css` for interaction, logo and new content layouts.
- Keep `AGANO_CONFIG.sites` as a four-entry string mapping for form context. Map records are separate in `assets/js/maps-config.js`.
- Keep site-config, navigation and contact first. Add filters, gallery, forms and maps only where their matching HTML features exist, then effects and main. All scripts are classic/deferred; navigation also starts itself early and remains idempotent.
- Preserve meaningful image alternatives, dimensions, thumbnail/large-image relationships and real gallery links. The homepage hero is high priority; below-fold imagery is lazy loaded.
- Refer to `docs/company-image-manifest.json`, `docs/image-provenance.json` and `docs/logo-provenance.json` for their distinct image sources.
- Add new crawlable pages to the sitemap and give them unique titles, descriptions, social metadata and correct canonical URLs.

No content-generation script is needed to maintain or run this distribution. Images and text remain editable assets, not application-runtime downloads.

## Hosting and deployment

Upload the web files with `index.html` at the document root. Documentation and `qa/` may remain outside the public root. Use the host's proper 404 response to serve `404.html`; do not install a single-page-app catch-all.

Use HTTPS. On hosts supporting `_headers`, the supplied file declares CSP, referrer, content-type, permissions and cache policies. Configure equivalent real response headers on other hosts and verify them after deployment. Static file upload alone does not prove header enforcement or TLS configuration.

The production canonical origin is `https://www.aganolegacyresources.co.zw`. All 32 pages, social metadata, Organisation/Article structured data, robots and sitemap URLs use that origin. The previous preview-host links and its framing allowance have been removed. Exact structured-data CSP hashes have been recalculated. Configure the domain, DNS targets and HTTPS certificate with the selected host; this ZIP update does not deploy or change DNS. Configure the host to redirect the non-www hostname to the preferred HTTPS www hostname when both are connected.

CSS/JS URLs use release token `20261022-verbatim`. Keep revalidation enabled and change that token consistently for future releases.

## Verification

With Node.js available for developer checks:

```sh
node --test qa/*.test.cjs
```

The website itself does not need Node. Checks support both `dist/` and the flattened ZIP layout.

112 automated checks cover the released source, including production-domain consistency, exact supplied wording, all 32 pages, links, media, navigation, forms, maps, performance budgets and palette contrast. The previous content release's Chrome 155 browser checks covered all 32 pages at 16 iframe viewport widths (512 checks), menu activation on every page, 20 additional menu cycles, synthetic portrait/landscape safe areas, keyboard access, gallery operation and a corporate WhatsApp preview with stale-link invalidation. These checks do not replace real Android/iOS, other browsers, screen readers, zoom, Lighthouse, field Core Web Vitals, live delivery or hosted-header testing. See `docs/testing-report.md` for the exact results and remaining limits.

## Reproduce asset reports

```sh
node scripts/audit-assets.cjs
```

This updates `docs/asset-sizes.json` using local file bytes and gzip level 9. It preserves the supplied comparison baseline. It does not measure network transfer, Lighthouse or Core Web Vitals.

To regenerate company-image derivatives from the original supplied files, install Pillow in a developer Python environment and run:

```sh
python3 scripts/optimise-images.py --source-dir /absolute/path/to/original-uploads
```

The source filenames and hashes are in the image manifest. Original gallery uploads are not duplicated in this ZIP; the full-size web views and brand master are included. Review visual quality and responsive selection after replacing imagery. Website hosting needs neither Python nor Node.

## Browser layout harness

For local developer QA only, `node scripts/prepare-browser-qa.cjs` copies the supplied harness into a temporary `__qa/` folder in the web root. Open `__qa/browser-harness.htm` through a local static preview. Select a page and widths, then refresh measurements. Single-width changes resize the same iframe so native breakpoint events can be inspected. `?height=320` supports short-screen checks. The Safe areas control applies explicitly synthetic CSS insets; it does not emulate iPhone hardware or Safari. This is a desktop-browser layout aid, not a device emulator or performance benchmark. Remove `__qa/` before release; do not publish the harness. The ordinary source checks and reports remain usable without it.

# AGANO Legacy Resources — UX, Performance and Mobile Navigation Update Prompt

Prepared by INJIVA Digital Systems • Research reviewed: 22 October 2026

## How to use this prompt

Attach the latest AGANO website ZIP or open its current source repository, then give the implementing developer or coding assistant the complete instructions below. This is an instruction to modify, verify and package the existing website. The production website must continue to use HTML5, CSS3 and vanilla JavaScript. Development and testing tools may be used without becoming browser runtime dependencies.

---

## 1. Mandate and professional roles

Update the existing AGANO Legacy Resources website to make information easier to find, pages faster to load and mobile navigation consistently reliable. Implement the changes in the actual source, validate the results and deliver an updated downloadable ZIP.

Apply the judgement of a senior frontend engineer, enterprise UX designer, information architect, web performance engineer, accessibility specialist, mobile interaction designer, application security engineer, technical SEO specialist, cross-browser QA engineer and deployment engineer. These are professional perspectives to apply; separate autonomous agents are not required.

Prioritise successful visitor tasks: understand AGANO, compare its mining assets, explore processing capabilities, view photographs, locate public contact information and prepare a relevant enquiry. A visitor using a modest Android device and a constrained Zimbabwean mobile connection must be able to complete these tasks.

Inspect before editing. Preserve the working multipage architecture, public URLs, client-supplied facts, imagery, document provenance, contact details and existing useful functionality. Complete routine implementation choices within this scope. Do not deploy, change DNS, send enquiries or modify external accounts unless separately authorised.

## 2. Scope: every page and every mining asset

Inventory every HTML page, shared component, script, stylesheet, font, image, document and third-party integration in the supplied version. Do not assume a previous page count is still current. Identify the canonical source and output directories before changing files.

The update must cover the homepage, corporate pages, operations, minerals, projects, galleries, sustainability, careers, procurement, news, contact, legal and accessibility pages, and these asset presentations:

| Asset presentation | Existing route to preserve if present |
| --- | --- |
| LonRho Gold & Antimony Mine | `sites/globe-and-phoenix.html` |
| Anzac Antimony Mine | `sites/sebakwe.html` |
| Sherwood Block Gold Mine | `sites/sherwood.html` |
| Pagamesa Antimony Mine | `sites/silobela.html` |
| Sebakwe Antimony Processing Plant | `processing.html` |

The processing plant is a separate facility, not a fifth mine. Retain existing enquiry identifiers and deep links unless a documented compatible migration is necessary. Correct relative asset paths on nested pages. Every header and footer must use the same navigation behaviour.

Preserve these supplied contact details:

- Head office: Room 10, Tauro Tragus Building, Kwekwe, Zimbabwe.
- Telephone and WhatsApp: +263 78 094 8702; WhatsApp destination digits: `263780948702`.
- Email: `info@aganolegacyresources.co.zw`.
- Office hours: Monday–Thursday 08:00–18:00; Friday 08:00–16:00; Sunday 09:00–13:00, CAT. Saturday hours were not supplied.

Do not add production statistics, certifications, staff identities, reserve estimates or exact map coordinates. Do not reinterpret Anzac’s unresolved “25%” shaft statement as a depth or grade.

## 3. Baseline audit and implementation plan

Create a recoverable working copy. Inspect the current source and reproduce reported problems before choosing fixes. Check especially:

- Conflicting mobile breakpoints, duplicate click listeners and CSS states that disagree with `aria-expanded` or `hidden`.
- Menus underneath other elements, clipped panels, invisible links remaining keyboard focusable and stale scroll locks.
- Large original images served as thumbnails, incorrect responsive image sizes and hero images discovered late.
- Blocking scripts, unnecessary dependencies, duplicated CSS and costly effects.
- Missing image dimensions, unstable headers and fonts, unintended horizontal overflow and overlapping fixed buttons.

Record a before-state page inventory, asset sizes, observable navigation defects and available performance measurements. If browser tools or a deployment environment are unavailable, label those checks as unperformed and continue with the supported source checks. Never invent a baseline score.

Prefer targeted fixes to replacement of working components. Resolve duplicate styles and state owners instead of accumulating conflicting overrides. Separate functional defects, accessibility barriers and visual refinements so the reason for each change is clear.

## 4. UX principles translated into behaviour

Use Nielsen’s usability heuristics as an evaluation framework, alongside WCAG 2.2 and the relevant WAI interaction patterns. Apply principles to observed visitor tasks rather than treating every design rule as universally applicable.

1. **Feedback:** immediately show navigation, filter and enquiry states.
2. **Familiar language:** use clear mine names and business terms visitors understand.
3. **Control:** make panels dismissible and changes reversible.
4. **Consistency:** keep shared controls, labels and placement predictable.
5. **Prevention:** constrain invalid selections before they become errors.
6. **Recognition:** expose useful choices and retain context.
7. **Efficiency:** offer direct routes to each asset and contact action.
8. **Restraint:** remove visual competition around the main task.
9. **Recovery:** explain errors and preserve entered information.
10. **Help:** place short guidance beside unfamiliar actions.

Support scanning with a clear type hierarchy, useful headings, concise introductory copy, related information grouped together and readable spacing. Use familiar interaction conventions. Avoid excessive choices in a single panel; use progressive disclosure for secondary detail. Prioritise sufficiently large, separated controls within comfortable reach on mobile.

Do not use fake urgency, misleading progress indicators, automatic carousel movement, scroll hijacking or decorative interactions that obstruct reading. Do not remove useful content simply to improve a numerical score.

## 5. AGANO design tokens and readable presentation

Use the representative colours extracted from the supplied brand image:

```css
:root {
  --agano-ivory: #FAF7F0;
  --agano-charcoal: #33383B;
  --agano-gold: #D1B485;
  --agano-steel-blue: #809AA8;
}
```

Apply ivory to reading surfaces, charcoal to primary text and dark surfaces, gold to selected emphasis and steel blue to supporting visuals. Keep these tokens configurable and integrate them into the existing design system. Retain the supplied logo’s proportions and identity.

Measure final colour combinations, including hover, focus, disabled, error and overlay states. Normal text needs at least 4.5:1 contrast; qualifying large text needs 3:1. Necessary control boundaries and state indicators need 3:1 against adjacent colours. Do not assume white text on gold or steel blue is readable. The sampled charcoal/steel-blue pairing is about 4.02:1, so it does not meet the normal-text threshold.

Use restrained metallic gradients only as decorative treatments. Keep text off changing metallic highlights unless every relevant background position passes contrast checks. Retain visible focus and understandable states in forced-colours mode.

Use fluid layouts, comfortable line lengths, consistent spacing and a practical mobile text size, normally around 16 CSS pixels. Do not block zoom or shrink text to force the desktop header to fit.

## 6. Mobile hamburger: essential implementation contract

Choose and document one appropriate interaction model for the main mobile navigation. Prefer a simple non-modal disclosure unless the design genuinely needs an overlay drawer. Keep the same model across all pages.

### Shared requirements

- Use a real `button type="button"`, with a clear accessible name such as “Main menu”, `aria-controls` pointing to a unique panel ID and accurate `aria-expanded` state.
- Give the hamburger button and separate close control at least a 44 × 44 CSS pixel target as the project’s preferred mobile size. WCAG 2.2 AA’s target-size criterion uses 24 × 24 CSS pixels with exceptions; do not describe 44 × 44 as its AA minimum.
- Keep a stable accessible name, or ensure any updated name matches visible wording. Hide decorative icon strokes from assistive technology.
- Support pointer activation and native Enter/Space button activation. Use one state owner and one activation path; do not add overlapping touch and click toggles that fire twice.
- Update semantics and interactivity promptly. Decorative icon animation must not delay the action or control whether it succeeds.
- Ensure closed content is absent from keyboard navigation and the accessibility tree. Opacity or off-screen positioning alone is insufficient.
- Prevent rapid taps, interrupted transitions, missing `transitionend` events or reduced-motion settings from leaving the interface stuck. The latest requested state must win.
- Escape closes the innermost open navigation layer first. Restore focus to its trigger when appropriate; do not steal focus from a newly activated destination or another intentionally focused control.
- Keep the trigger, close control and all navigation destinations reachable. No overlay may obscure the control required to dismiss it.
- Reset incompatible mobile states when entering desktop layout. Release any lock, backdrop or inert state. If the focused element would disappear, move focus to a meaningful visible equivalent.
- Verify orientation changes, short landscape screens, browser back/forward restoration, repeated initialisation and page return from WhatsApp.

### Non-modal disclosure

Use ordinary navigation links within a labelled `nav`, with lists representing hierarchy. Allow Tab and Shift+Tab through visible controls in normal document order. Do not trap focus, mark the background inert, lock page scrolling unnecessarily or add `aria-modal`. Provide explicit toggle and Escape dismissal; outside activation or focus leaving the navigation may close it without redirecting the user’s focus.

### Modal drawer, only if selected

Implement actual modal-dialog behaviour, preferably using a suitable native dialog implementation. Give it a meaningful accessible label. Move focus inside when opened, contain sequential focus while active, make outside content inert and restore focus appropriately on dismissal. A toggle outside an inert region cannot serve as the only reachable close control: include a working close button inside the drawer.

Lock background scrolling without causing a horizontal jump or losing the visitor’s position. Preserve and restore previous styles and scroll position, including on iOS. Avoid releasing a shared scroll lock while another modal still needs it. Use a scrollable panel with dynamic viewport sizing, a fallback, safe-area padding and adequate bottom space. The last link must remain reachable behind neither browser chrome nor the on-screen keyboard.

### Dropdowns and resilience

Use separate controls for a parent link and its disclosure when both actions exist. Do not make the first tap on a destination merely simulate desktop hover. Ordinary website navigation must not use `role="menu"` or `role="menubar"` unless the full corresponding application-style interaction is intentionally implemented.

Use content-driven breakpoints that also work on tablets and touch laptops. Desktop dropdowns must work through explicit activation and keyboard use; hover may supplement them. Hover-revealed content must be dismissible, reachable and persistent while being used.

Preserve navigation when JavaScript is unavailable or initialisation fails. Start from usable HTML; collapse enhanced navigation only after its controls are successfully wired. A failure in a gallery, animation or map must not disable the menu.

## 7. Responsive layout and accessibility

Target WCAG 2.2 AA across the implemented experience and report the checks actually performed. Verify:

- Semantic landmarks, one meaningful main heading per page, logical headings and a visible-on-focus skip link.
- Proper link/button semantics, useful alternatives for meaningful images and empty alternatives for decorative imagery.
- Clear focus indicators, logical focus order and no unexpected keyboard trap. Sticky headers, drawers and floating WhatsApp controls must not cover focused elements.
- Layout reflow at 320 CSS pixels, 200% text resizing, and representative 400% browser zoom on a desktop viewport. Permit local two-dimensional interaction only where the content genuinely requires it, such as a map.
- Usable text spacing, long headings, email addresses and links without clipping. Avoid fixed content heights and arbitrary truncation.
- Visible form labels, meaningful instructions, suitable autocomplete/input modes, text error messages linked to affected fields, and status announcements that do not interrupt every keystroke.
- Portrait and landscape support, comfortable touch spacing and no essential interaction requiring hover, dragging or a complex gesture.

Test widths of 320, 375, 430, 768, 1024, 1280, 1440 and 1920 CSS pixels, plus both sides of the actual navigation breakpoint. Also test a short landscape viewport and an opened software keyboard. Do not conceal layout defects with global `overflow-x: hidden`.

## 8. Image and asset delivery for every mine and facility

Audit each mine page, the processing plant, galleries and shared branding independently. Preserve source photographs and captions; make mechanical web derivatives without changing what the photographs depict.

Generate suitably sized WebP and, where beneficial, AVIF derivatives with a tested fallback. Use accurate `srcset` and `sizes` for the actual layout and retain valid `src` URLs. Choose widths from measured display requirements; do not upscale or produce redundant variants. Confirm real browser selection at mobile and desktop widths.

The primary hero/LCP image must be discoverable in initial HTML, load eagerly (`loading="eager"`, or the default) and use `fetchpriority="high"` when appropriate. Do not lazy-load it. Prefer a responsive image element where suitable. If a CSS hero requires preloading, match the actual resource selection and verify that it does not trigger duplicate downloads. Do not preload every image or mark every resource high priority.

Reserve image space with correct `width`, `height` and aspect ratios. Use `loading="lazy"` for suitable below-the-fold images and `decoding="async"` where appropriate. Serve actual small logo and thumbnail assets rather than full-resolution masters. Retain sharp branding and meaningful subject framing.

Open large gallery images on demand. Do not download all full-size gallery images at startup. Keep thumbnails, captions and basic image links useful if gallery enhancement fails. Lazy loading is a browser scheduling hint; measure real requests rather than promising that every off-screen resource will remain unfetched.

Remove orphan assets only after checking HTML, CSS, JavaScript and structured content references. Preserve originals needed for handover outside the public download path where practical. Do not expose confidential source files.

## 9. CSS, JavaScript, fonts and resource scheduling

Keep the production runtime dependency-light and entirely HTML, CSS and vanilla JavaScript. Reuse existing modules where sound. Minimise unused CSS and JavaScript, preserve script ordering and defer nonessential execution. Initialise navigation early without waiting for images, third-party embeds, `window.load` or a lengthy gallery setup.

Avoid long synchronous tasks, repeated DOM scans, read/write layout loops and unnecessary work during input. Break expensive work into smaller scheduled tasks when needed. Feature-detect newer APIs and keep an equivalent working fallback. Use event delegation where it simplifies the design; make initialisers idempotent.

Use a system font stack or a small, licensed, locally hosted WOFF2 selection. Limit weights, choose a deliberate `font-display` strategy and use compatible fallback metrics. Preload only genuinely critical font resources. Do not convert the supplied raster logo to an inaccurate replacement simply to reduce bytes.

Keep critical presentation discoverable without hiding the page behind JavaScript. Optimise stylesheet delivery only where measurement supports it; no flash of unstyled content or accessibility regression is acceptable. Minification must retain maintainable source and a reproducible process.

Do not prefetch the entire site, fetch all gallery originals, add a framework or introduce a service worker solely to chase a performance score. Any added runtime dependency needs a clear user benefit and measured justification.

## 10. Motion and smooth interactions

Use motion to explain changes, not to postpone usability. Suggested project timings are approximately 120–200 ms for small feedback and 180–250 ms for drawer or disclosure transitions; tune with testing rather than treating these as standards.

Prefer transform and opacity for movement. Avoid layout-heavy animation, persistent costly filters, unnecessary layer promotion and global `transition: all`. Keep hover effects subtle and apply them appropriately to fine pointers. Do not rely on animation completion callbacks for essential state cleanup.

Respect `prefers-reduced-motion` in CSS and JavaScript, including changes during the session. Remove nonessential entrance motion and smooth scrolling for this preference. Keep information immediately available when effects are disabled. No parallax or continuously moving decorative content is required.

If section reveals remain, use Intersection Observer carefully, stop observing completed reveals and provide a failure-safe visible state. Do not delay the hero or its heading with a reveal. Use browser-native scrolling and suitable anchor offsets for sticky headers.

## 11. Galleries, maps, filters and enquiries

Preserve working filters, expanders and gallery controls. Announce meaningful result changes, provide a useful empty state and make reset straightforward. Keep core asset descriptions crawlable and available without JavaScript.

For the lightbox, provide labelled controls, keyboard close/previous/next actions, appropriate dialog focus behaviour, a visible close action, a loading/error state and a valid image-link fallback. Do not add swipe-only functionality. Prevent stale image load events from updating a newly selected image.

Keep maps behind deliberate activation, with a descriptive placeholder and fixed space. Do not contact Google, create a live embed, preconnect or load its JavaScript before the intended activation. Retain a working public map-search link and allow removal of a loaded embed. A search result is not a verified mine entrance. Show exact directions only for a verified, authorised public location.

Preserve WhatsApp enquiries as an explicit visitor-controlled handoff to `https://wa.me/263780948702`. Validate and bound plain-text inputs, encode the message, show an accurate preview and require the visitor to choose the handoff. Explain that the visitor sends inside WhatsApp. Do not report delivery, server receipt or automatic submission.

Editing a reviewed message must invalidate the old handoff. Handle long messages with a clear copy/manual-paste fallback and preserve input when an external app cannot open. Clipboard feedback must reflect whether copying actually succeeded. Use safe links and no embedded credentials, automatic document transfer or unnecessary personal-data storage.

If the existing project has no configured backend, do not invent server validation, rate limiting, email delivery or saved applications. Preserve the honest static workflow. A separately requested backend must have genuine server-side validation and abuse controls before being called operational.

## 12. Caching, hosting and security preservation

Keep URLs, metadata, sitemap entries, local document links, crawlability and useful 404 behaviour intact. Update asset references consistently, including nested paths and structured metadata.

Use long-lived immutable caching only for assets whose content changes produce a new fingerprinted URL. Keep HTML, configuration and unversioned assets on an appropriate revalidation policy. Never make changeable assets stale for a year under unchanged filenames. Check both cold and repeat visits.

Provide compatible compression and caching configuration for the selected hosting environment. State which headers require actual host support. Client JavaScript cannot configure TLS or server compression. Do not claim these are active without response-header verification.

Preserve a restrictive Content Security Policy. Recompute exact hashes where changed inline structured data requires them. Do not add broad `unsafe-inline`, `unsafe-eval`, wildcard origins or relaxed frame rules for convenience. Use safe DOM APIs for user content; avoid injecting untrusted HTML. Keep third-party URLs explicitly allowlisted and secrets out of the package.

## 13. Performance targets and project budgets

Use the following Core Web Vitals goals for real-user measurements at the 75th percentile, evaluated separately for mobile and desktop:

| Metric | Goal |
| --- | --- |
| Largest Contentful Paint | At most 2.5 seconds |
| Interaction to Next Paint | At most 200 milliseconds |
| Cumulative Layout Shift | At most 0.1 |

Use lab measurements to diagnose and compare implementations. A Lighthouse navigation report does not establish real-user INP; Total Blocking Time is a diagnostic, not an interchangeable result. If field data is unavailable, say so.

Adopt these starting engineering budgets, subject to the actual baseline and visual review. They are project choices, not W3C or Google requirements:

- Combined initially requested CSS and JavaScript: preferably at most 100 KiB compressed per representative page.
- Selected mobile hero: preferably at most 250 KiB; selected desktop hero: preferably at most 450 KiB.
- Individual gallery thumbnail: preferably at most 80 KiB, with visual quality checked.
- Initial cold-load transfer: preferably at most 1 MiB on a representative mobile page; report actual requests and bytes.
- Maps and full-resolution gallery images: no eager startup downloads; inspect native lazy-loading behaviour separately.

Aim for Lighthouse scores of at least 90 in performance, accessibility, best practices and SEO on representative pages under a recorded configuration. Report actual scores and explain material budget exceptions. No score alone establishes accessibility, security or production readiness.

## 14. Required verification and acceptance

Run the existing meaningful checks first, then add focused regression coverage for changed behaviour. Test every HTML route for broken local links, fragment targets, missing resources, unique IDs, navigation consistency and JavaScript errors. Record the current page count rather than copying an old report.

Use supported browser tools for functional verification over the intended static-serving environment. Cover the homepage, every mine profile, the processing plant, gallery, contact, procurement, careers and at least one nested article. Check header operation on every route.

### Mobile navigation acceptance

- Opening, closing, Escape, keyboard traversal and appropriate focus restoration work.
- Twenty successive open/close cycles and rapid repeated input leave the correct final state.
- Submenu activation does not accidentally navigate; real links remain independently usable.
- Hidden content cannot receive focus. A non-modal disclosure does not trap it; a selected modal model contains it correctly.
- Resizing across the breakpoint, rotating, returning through browser history and leaving/reopening an external app do not leave stale overlays, inert content or locked scrolling.
- The final link and close action are reachable on short screens, with a software keyboard, and at enlarged text sizes.
- Navigation works with a mouse, touch, keyboard and the available assistive technology. No hover-only destination or duplicate activation remains.
- Disabled or failed JavaScript leaves a usable route to the main pages.

### Performance and responsive acceptance

Measure before and after using the same browser version, viewport, throttling and cache conditions. For a representative mobile and desktop page, take three cold-load runs and report the median. Record network and CPU settings explicitly; use a constrained mobile profile as an additional scenario. Inspect repeat visits, network waterfalls, chosen image variants, layout-shift sources and menu interaction traces.

Run appropriate automated accessibility checks and manual keyboard review. Test NVDA with a supported desktop browser and VoiceOver on iOS where available; consider TalkBack on Android for the mobile menu. Test actual Safari and Firefox when available, and record Chrome and Edge versions. WebKit automation does not constitute testing on a physical iPhone.

Do not manufacture cross-browser, screen-reader, Lighthouse, network-panel or live WhatsApp evidence. Use “passed”, “failed”, “not run” and “requires production configuration” precisely. Document every material outstanding issue and its impact.

## 15. Deliverables and completion criteria

Deliver the modified source and a complete deployable static ZIP, not just recommendations or code fragments. Include:

1. Every linked page and required optimised asset, preserving supported existing functionality.
2. Maintainable HTML/CSS/JavaScript and any reproducible development scripts actually used.
3. A concise change log describing the problems fixed and resulting behaviour.
4. A test report with page coverage, browser/device versions, measurement conditions, before/after results and limitations.
5. An asset report listing image variants, transfer sizes, caching strategy and justified budget exceptions.
6. Updated maintenance instructions for navigation, design tokens, imagery and responsive sizes.
7. Hosting notes identifying configuration that is prepared versus verified active.
8. A validated ZIP with working relative paths, no missing files, no credentials and no unnecessary temporary output.

Keep the release reviewable and compatible with VS Code and Git. Preserve the existing deliverable’s identity when updating it through a file-management system that supports versioned replacement. Never silently publish the release as part of packaging.

Conclude with the downloadable ZIP, a short account of the changes, measured evidence and remaining deployment or testing limitations. Use “production-ready” only when the relevant functional, accessibility, security, configuration and production checks support that statement.

## 16. Authoritative research to use during implementation

Review current versions when executing this prompt. The following sources informed this update specification; the WAI examples describe patterns and require implementation-specific testing rather than blind copying into production.

- Nielsen Norman Group — [10 Usability Heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/).
- W3C — [WCAG 2.2](https://www.w3.org/TR/WCAG22/).
- WAI — [Disclosure navigation](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/) and [modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).
- WAI — [Target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), [reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), [text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html), and [focus not obscured](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html).
- Google web.dev — [Web Vitals](https://web.dev/articles/vitals), [LCP optimisation](https://web.dev/articles/optimize-lcp), [INP optimisation](https://web.dev/articles/optimize-inp), and [CLS optimisation](https://web.dev/articles/optimize-cls/).
- Google web.dev — [Responsive images](https://web.dev/learn/design/responsive-images), [browser image lazy loading](https://web.dev/articles/browser-level-image-lazy-loading), [animation performance](https://web.dev/articles/animations-guide), and [reduced motion](https://web.dev/articles/prefers-reduced-motion).
- MDN — [Cache-Control](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control), [native dialog](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog), and [native button](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button).

Apply the relevant guidance to the actual implementation, resolve conflicts in favour of accessible task completion and measured reliability, and explain consequential trade-offs. Do not claim to have followed every UI/UX principle or achieved compliance without evidence.

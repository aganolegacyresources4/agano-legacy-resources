# UX effects and interaction inventory

Release: 20261022-verbatim. Runtime: HTML5, CSS3 and vanilla JavaScript.

## Design system

The supplied brand image informed ivory #FAF7F0, charcoal #33383B, gold #D1B485 and steel blue #809AA8. These representative colours and accessible supporting tokens are configurable at the top of `assets/css/main.css`. Text, focus and input-border colour pairs are covered by numerical contrast checks. This is not a blanket accessibility certification.

Core copy, headings and primary actions appear immediately. There is no page loading gate, scroll hijacking, autoplay carousel, artificial production counter or remote animation dependency.

| Component | Behaviour | Configured timing and fallback |
| --- | --- | --- |
| Hero heading and actions | Immediately readable | No entrance delay |
| Hamburger | Menu label, three bars become a cross | 180 ms; state changes immediately |
| Mobile navigation | Non-modal disclosure with internal scrolling | 220 ms entrance; immediate semantic close |
| Native dropdown | Expand/collapse, current-page context | 160 ms caret / 220 ms entrance |
| Cards and thumbnails | Restrained fine-pointer hover, visible keyboard focus | 150–220 ms; no movement for reduced motion |
| Secondary section reveal | Once per observed block | 480 ms in effects.js, card stagger up to 165 ms; underlying content is never hidden |
| Gallery | Native modal, loading/error text, previous/next controls | 220 ms entrance, 180 ms loaded-image feedback; immediate dismissal |
| Forms | Error summary, linked field errors, exact text preview | Immediate state and 150 ms border feedback |
| Filters | Native selection, result count, reset | Immediate result visibility |
| Article progress | Decorative native progress control | One scheduled frame per scroll update |
| Utility dock | Yields near forms/footer and when the mobile menu opens | No attention-seeking movement |

These timings describe code configuration, not measured response latency. CSS timing tokens affect CSS transitions; observer, dialog and image timings are explicit in their JavaScript modules.

## Navigation contract

`navigation.js` starts early from its deferred script and is idempotent when main calls it again. It wires handlers before marking the document enhanced. Static links and native details remain visible if enhancement cannot start.

The visible Menu button has a stable Main menu accessible name and controls `primary-nav`. Its controller owns `hidden`, `aria-expanded` and the visual open class. The closed panel is excluded from focus and accessibility navigation; it is not merely transparent or off-screen.

The mobile layout runs up to 1100 px; desktop begins at 1101 px. Both CSS and matchMedia must change together if adjusting it. At desktop entry, a focused disappearing trigger moves to a visible navigation control. At mobile entry, a focused collapsing navigation link returns to the visible trigger.

This navigation is non-modal. It has no focus trap, global inert state or body-scroll lock. Tab follows document order. Escape closes the inner disclosure and returns to its summary before closing the outer panel. Arrow Down opens a summary's group and focuses its first link. Pointer/focus leaving the header closes open navigation without replacing a new outside focus target. Real link activation closes without preventing the browser navigation. Modified link activation retains ordinary browser behaviour.

The panel sits below the actual header, uses dynamic viewport height, has a fallback and its own short-screen scrolling. It includes safe-area padding. Opening/closing never relies on animation completion, and rapid activation cannot strand a half-closed state.

## Galleries and forms

Only `gallery.html` includes the dialog and gallery controller. Each thumbnail remains a real link. Large images are requested on activation, and request tokens reject stale callbacks. Native Escape or the close button dismisses immediately and returns focus, even if an entrance animation has not completed. Browser-tested image loading, advancing and focus return are recorded in `browser-checks.json`.

All three enquiry forms keep category allowlists, bounds, plain-text preview, error links, privacy acknowledgement and explicit WhatsApp handoff. Fields enable only after handlers are installed. Counters are not live regions. Empty textarea tags contain no formatting whitespace. Editing clears the prior handoff. Copy feedback follows the actual asynchronous result and message revision. Nothing is sent automatically or stored in a database or browser storage.

## Motion, layout and maintenance

Reduced-motion preferences are handled in CSS and JavaScript, including preference changes. Effects stop for focused content, hidden documents and printing. Without observer support the content remains visible and the utility dock remains in flow. Main reading content does not depend on animation APIs.

Keep reveal content visible in base CSS. Use `data-reveal` only for secondary blocks. The system measures article geometry on meaningful changes, coalesces scroll work and avoids per-keystroke layout work. Forms use readable mobile sizes, grids have bounded tracks and forced-colours users retain control/focus cues.

When changing a feature, update all relevant static page references and run the developer QA. Keep navigation, forms and gallery logic independent of optional effects. Do not add an effect that delays a visitor's action or weakens contrast.

## Browser verification boundaries

Chrome 155 tests covered every page at ten CSS viewport widths, Menu activation on every page, twenty repeated cycles, native Enter/Space, nested Escape, short landscape Tab access, breakpoint focus, filters, gallery and all three previews. Viewports were rendered in same-origin iframes in the desktop engine. Actual mobile hardware, coarse-pointer behaviour, assistive technology, system reduced-motion switching, zoom and other browsers require separate verification.

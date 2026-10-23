# Browser and iPhone compatibility

Release: 20261022-verbatim. Reviewed 22 October 2026.

The engineering target is current and recent Chrome, Edge, Firefox and Safari on desktop, Android browsers and current/recent iOS browsers. This is a support target, not a claim that every browser or physical device has passed testing. Browser branding alone does not establish engine or device coverage.

| Browser/environment | Evidence for this release | Status |
| --- | --- | --- |
| Chrome 155, Linux, DPR 1 | All 32 pages at 16 iframe widths; navigation, gallery and form review | Passed documented checks |
| Safari on current/recent iPhone and iPad | Standards/fallback review; synthetic safe-area spacing in Chrome | Physical device and WebKit run outstanding |
| Safari on macOS | Feature-based review only | Browser run outstanding |
| Edge and Firefox | Standards/fallback review and source logic checks | Browser runs outstanding |
| Chrome/other browsers on iOS | Responsive source and safe-area treatment | Device/browser runs outstanding |
| Android Chrome and Samsung Internet | Responsive layouts reviewed in Chrome desktop frames | Touch-device runs outstanding |

## Compatibility treatment

- All 32 viewport declarations keep browser zoom available and opt into viewport-fit=cover. No maximum-scale or user-scalable restriction is set.
- Safe-area environment values feed CSS tokens for left/right content gutters, header top, footer bottom, floating controls and mobile menu bounds. Regular spacing remains the minimum. Browser defaults are zero where no inset applies.
- Dynamic viewport heights have preceding vh fallbacks. The scrollable mobile navigation subtracts the actual header container and safe insets, rather than locking the body to a fixed viewport height.
- Mobile inputs and the readonly message preview use 16 px text. Text-size-adjust is 100%; this does not disable pinch zoom. No custom keyboard or touch gesture is required.
- A real button controls navigation; native details/summary handle groups. Click and keyboard actions share the same state. Media-query listeners support both change events and the older addListener interface. Page-cache restoration resets navigation coherently.
- The gallery uses feature-tested native dialog. Ordinary image links remain if showModal is absent or opening fails. A closed dialog is hidden in CSS even without native dialog support. Close and focus return do not depend on an animation finishing.
- Optional animations and observers fail back to visible content. Decorative :has/text balancing and modern image priority hints are enhancements; core content is present in HTML.
- There are no third-party runtime fonts, frameworks or CSS/JS CDNs. Native responsive images are local WebP assets. Historical browsers without the baseline CSS/JavaScript/WebP support are not certified.

## Actual synthetic spacing observations

Portrait: 430 × 720 frame, synthetic 47 px top and 34 px bottom. The header became 144.25 px tall, the open panel stayed above the bottom inset, Arrow Down entered Company and nested Escape restored focus. Twenty additional open/close cycles finished collapsed.

Landscape: 874 × 320 frame, synthetic 59 px left/right and 21 px bottom. Header gutters were 59 px, the final Contact AGANO link stayed reachable inside the scrollable menu and Tab could leave it. The gallery loaded an image, advanced and closed with focus returned; its bounds stayed inside the synthetic clearances within subpixel tolerance.

These overrides exercise CSS spacing in Chrome. They do not emulate a notch, Dynamic Island, Safari toolbars, the home indicator, hardware touch, high DPR, VoiceOver or the iOS software keyboard.

## Required device/browser acceptance run

On current and recent physical iPhones, test portrait and landscape, expanded/collapsed browser toolbars, repeated menu taps, scrolling to the last menu link, text zoom, pinch zoom, VoiceOver, software-keyboard focus and dismissal, gallery close/next/previous, browser Back restoration and WhatsApp open/review/send. Test Safari and any additional installed iOS browsers explicitly. Repeat representative desktop checks in Safari, Edge and Firefox. Record OS/browser versions and actual results before claiming full browser acceptance.

## Primary technical guidance

- WebKit safe-area guidance: https://webkit.org/blog/7929/designing-websites-for-iphone-x/
- WebKit viewport units and progressive features: https://webkit.org/blog/12445/new-webkit-features-in-safari-15-4/
- WebKit native dialog behaviour: https://webkit.org/blog/12209/introducing-the-dialog-element/
- WAI disclosure navigation example: https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/


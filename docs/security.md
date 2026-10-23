# WhatsApp design and trust boundaries

This static website prepares messages locally. It does not expose an email endpoint, collect an enquiry database, send through a Business API or hold account credentials. Preparation and preview produce no network request. The visitor's external-link action initiates the WhatsApp handoff.

Input controls and JavaScript apply value types, bounds, category choices, privacy acknowledgement, control-character checks and a honeypot. These are local validation controls, not a claim that browser code authenticates people or rate-limits WhatsApp.

The recipient is read only from public site configuration. Only a normalised international digit string enters the path. The destination origin is hardcoded to `https://wa.me/`. User content is URL-encoded. Invalid destination values are rejected. An empty recipient uses the documented chooser rather than an invented number.

The preview uses a read-only text value; no user field is inserted through innerHTML. Visitors can review, edit or copy the message. Changes invalidate the previous link. Long encoded messages retain their full preview and receive explicit copy/paste instructions.

No popup, automatic send, handoff-triggered form clearing or delivery confirmation is implemented. External links use noopener/noreferrer and no-referrer. No API keys, browser-storage persistence, tracking pixel or upload handler is included.

The CSP allows local scripts, hashes the JSON-LD, prohibits arbitrary network connections and blocks native HTTP form navigation. Verify its actual enforcement on the host. HTTPS, browser/OS behaviour, recipient identity, account access and WhatsApp's service remain outside these local checks.

Do not call the site fully secure based on these controls alone. Test the intended browser and real account before relying on a live handoff. Keep messages non-confidential; URL preparation and third-party handling are explained in the privacy notice.

WhatsApp's official click-to-chat/message-only format reference:
https://faq.whatsapp.com/5913398998672934

The user-supplied AGANO number +263 78 094 8702 is configured for direct routing in all three forms. No INJIVA number is substituted. Actual WhatsApp account registration and delivery were not checked.

## Enhanced UX controls

The interaction layer preserves the existing restrictive CSP. It uses local CSS, classic scripts, safe node/text construction and a native progress value instead of injecting inline styles. The new local SVG is a static icon. No animation CDN, remote font, tracking request or credential is added.

Custom form validation is installed before JavaScript enables the fields. Errors are linked to their inputs and displayed as text. Modified forms invalidate old message links. Clipboard operations use a pending state for the real asynchronous action and a message revision guard prevents stale success feedback. These changes do not add a server-side security boundary or make the static site an authenticated submission service.

Full-size gallery image requests occur only after an image is activated. Stale callbacks cannot overwrite the current image. Opening, closing and focus restoration use native dialog semantics. Existing real image links remain the non-JavaScript fallback.

## Site context and office links

The four company-provided site slugs may prefill an empty corporate-enquiry subject. Unknown and prototype-like keys are ignored, and existing visitor-entered text is preserved. Site context is not permission to send a message. All normal validation and the explicit WhatsApp review step still apply.

The current six location cards provide external name/address searches rather than verified pins. Opening email, telephone, Maps or WhatsApp remains the visitor’s explicit action.

## Optional Google Maps boundary

Only the six location pages load the new local maps assets. All released location records are search-only. No Google iframe, tile, thumbnail, preconnect, SDK, geolocation request or stored activation is present on initial load. A verified record with a genuine configured embed can reveal a load control; the iframe is created only when that control is activated. The remove control destroys the frame without removing the external links or claiming to erase Google's prior handling of information.

Embed sources are parsed and restricted to the exact HTTPS origin `https://www.google.com`, either the supported share-embed path with `pb` or the Maps Embed API place endpoint with a key and destination. Credentials, explicit ports, lookalike domains, unsupported protocols/paths, fragments and unknown/duplicate parameters are rejected. This is URL syntax validation, not evidence that a pin is correct or a service key is authorised. Verification records and actual HTTPS browser checks remain necessary.

Location names and iframe attributes are assigned with DOM/text methods. Enquiry contents never enter map configuration or URLs. Search and directions values are encoded, bounded to Google's Maps URL limit and built on a fixed origin. Directions require a verified record with an established public address or Place ID. An unverified site name cannot become a directions destination. The original four-entry enquiry-site mapping and WhatsApp routing remain independent.

The CSP change is limited to `frame-src https://www.google.com`; the existing script hashes, `connect-src 'none'`, `form-action 'none'`, `frame-ancestors`, local resource directives and other headers remain. The iframe has `referrerpolicy="strict-origin-when-cross-origin"` to allow a restricted browser key to receive the website origin, while the page-wide `no-referrer` policy and external-link protections remain in place. No full enquiry URL is deliberately passed as the iframe referrer. Actual host enforcement and browser behaviour were not verified.

No browser API key is configured. If added later, it must be a dedicated Maps Embed API key restricted to intended HTTPS website origins. It is public, not hidden by source configuration or environment variables. No server credential belongs in this code. No billing or paid service was enabled during this update.

The iframe's cross-origin load event is not a success signal. The interface retains fallback links and reports a requested/opened frame with a qualified availability message. Removal clears its reference; late callbacks from a removed frame cannot change the current state. There are no persistent map choices or loading timers. `MAPS_SETUP.md` documents the remaining network, CSP/referrer, keyboard, responsive and provider checks. These controls do not establish full security, accessibility or legal compliance.

## Content and branding update — 22 October 2026

Company-supplied mine names are stored as strings under the same four allowlisted enquiry slugs. The processing-plant map record is a separate facility and does not become an additional form site key. Office hours are public strings rendered through textContent, with static HTML fallbacks. Header/footer logos, gallery images and browser icons are local assets. New Organisation logo/hour fields have exact CSP hashes recalculated; script and connection permissions remain restrictive. No server endpoint, upload handler, analytics service or credential was added.

## UX/performance edition — 22 October 2026

Conditional script delivery removes unused gallery, form and filter controllers from unrelated pages. Navigation has one idempotent state owner; hidden menu links cannot remain available through opacity alone. Its non-modal design creates no global inert state or scroll lock. Gallery dismissal is immediate and does not depend on animation completion. The default blank textareas contain no whitespace values.

All image derivatives remain local. No CDN, analytics event collector, font provider, upload service or new credential was added. HTML has explicit revalidation rules alongside the existing JS/CSS revalidation and one-hour public asset cache rule. Long immutable caching is not enabled for changeable, unversioned image filenames. The host must actually support and enforce `_headers`; no production headers or TLS configuration were changed by this ZIP update.

Local Chrome checks verified exact message previews and fixed AGANO WhatsApp recipients for general, supplier and career enquiries. No test message was sent and account registration/delivery remain unverified. A deliberately external handoff is not an authenticated application backend.


## Production origin update — 23 October 2026

The selected canonical origin is https://www.aganolegacyresources.co.zw. Canonical/social URLs, structured data, robots and sitemap references were updated together. All four distinct structured-data script hashes were recalculated. The former preview-host framing permission was removed; frame-ancestors now permits only self. Existing Google frame loading, local resource restrictions and WhatsApp handoff boundaries remain unchanged. Actual DNS, certificates and production response-header enforcement were not configured or verified by this ZIP update.

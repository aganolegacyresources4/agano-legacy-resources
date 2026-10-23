# AGANO location integration

Release: 20261022-ux. Updated 22 October 2026.

## Included in this ZIP

The LonRho, Anzac, Sherwood Block and Pagamesa profiles have `#location` sections. Existing profile URLs and enquiry slugs are retained. Their portfolio cards link directly to those sections. The head office has its own `contact.html#office-map` section. The processing facility has its own `processing.html#location` section; these are separate from the four mines.

Every section currently provides a clearly labelled Google Maps search and a working contact link. The supplied mine names, general locations and office address did not establish precise AGANO pins or visitor entrances in the public references checked. No coordinates, Place IDs, Google-generated embed sources or browser API keys have been invented. Consequently, **no embedded map or exact directions destination is enabled in this release**.

Read `docs/location-verification.md` for the evidence and status of each location. This is an implemented search integration with optional embed support, rather than a claim that six verified Google maps are configured.

## Files and script order

- `assets/js/maps-config.js`: public location data and optional restricted browser key.
- `assets/js/maps.js`: URL validation, link construction and optional click-to-load/remove controls.
- `assets/css/maps.css`: responsive cards, a local illustration, keyboard skip links and reserved map dimensions.
- `assets/js/main.js`: guarded `initMaps` registration within the existing initialisation sequence.

Only `contact.html`, `processing.html` and the four `sites/` profiles load the maps stylesheet and two maps scripts. Shared scripts are site-config, navigation, contact, effects and main. Location pages insert maps-config and maps before effects/main; contact also inserts forms after contact. Filters and gallery are loaded only on their own pages. All scripts are classic/deferred. There are no module imports, remote SDKs or mandatory installation steps.

`AGANO_CONFIG.sites` remains the four-entry slug-to-name string mapping for enquiry prefilling. Do not replace it with map objects. Map records are independently keyed by the four retained site slugs, `head-office` and `processing-plant`.

## Configuration fields

| Field | Meaning and accepted value |
|---|---|
| Object key | Stable slug matching `data-location` in the HTML |
| `name` | Display name; keep consistent with the static heading and accessible search-link name |
| `kind` | `site`, `office` or `facility`; office and plant are not additional mines |
| `searchQuery` | Public name/address with Zimbabwe; no assumed district or sensitive detail |
| `status` | `search-only` until the public destination has been verified; then `verified` |
| `publicAddress` | Established public address; a supplied address alone does not verify a map pin |
| `placeId` | Actual verified Google Place ID, or an empty string |
| `embedUrl` | Actual Google-generated iframe source, or an empty string |
| `verification.verifiedOn` | Date of destination verification in YYYY-MM-DD form; empty if unverified |
| `verification.sourceUrl` | HTTPS evidence identifying the correct public destination; empty if unavailable |
| Top-level `embedApiKey` | Optional dedicated, restricted Maps Embed browser key; currently empty |

The source URL and date are editorial records, not automated proof of ownership or accuracy. A syntactically accepted embed URL also does not prove that its map or API key works. Verify the destination itself before changing its status.

## Enable a genuine shared embed

1. Establish the correct AGANO public destination from reliable evidence. Cross-check the company association, address and public visitor/contact location. Do not reuse a historic mine, town centre, river or another business simply because the name matches.
2. In Google Maps, use **Share or embed map → Embed a map → Copy HTML** for that destination.
3. Copy only the iframe's actual `src` URL into that location's `embedUrl`. The supported share source is `https://www.google.com/maps/embed?pb=…`. Preserve the Google-generated value; do not construct `pb` yourself. If copying HTML-encoded attributes, decode attribute entities such as `&amp;` to their actual URL characters. Never paste iframe HTML into JavaScript or a page.
4. Record the evidence URL and date, and set the record's status to `verified`. Add the genuine public address or Place ID only when established. Leave `embedApiKey` empty when using a shared embed that does not require one.
5. Update the verification record and matching static HTML text/search link so visitors without JavaScript receive consistent information. If a verified destination is available, the script enables directions; a shared embed alone does not manufacture an address or Place ID.
6. Perform the HTTPS checks below. A valid configured embed reveals Load Google Map; no request is made until it is activated.

Only `https://www.google.com/maps/embed` with a single nonempty `pb` parameter and the supported `/maps/embed/v1/place` API endpoint pass the URL validator. Other origins, credentials, explicit ports, unsupported paths, fragments and unknown/duplicate parameters are rejected. Invalid configuration leaves the static search/contact links in place.

## Optional Maps Embed API

Use this route only when an appropriate Google project and restricted browser key have actually been configured. This release does not enable a Google project, change billing or provide a key.

Use a dedicated browser key restricted to the **Maps Embed API** and the exact intended HTTPS website referrers. Include a staging origin only if it is needed for testing. Add the actual key to `embedApiKey`, leave the location's `embedUrl` empty and provide its verified Place ID or public address and verification record. The module constructs Google's documented `/maps/embed/v1/place` URL. It never substitutes the unverified site name as an API destination.

A browser key is visible in source and iframe requests. A JavaScript variable or build environment variable does not hide it. Never use a server credential, private key, service-account credential or unrestricted key here. Do not remove restrictions to make a `file://` preview work. Retire and rotate an exposed unrestricted key through the provider's controls.

## Privacy and security behaviour

Initial pages contain no iframe, Google thumbnail, remote map tile, preconnect, geolocation request or stored map activation. Static external links work without JavaScript. Activating a verified embed creates one titled, dimensioned iframe. Repeat clicks do not create duplicates. Remove map destroys that iframe, restores the local illustration and returns focus to the load control. Old frame callbacks cannot overwrite the restored state.

The page reports only observed states. An iframe `load` event can also occur for a Google error page, so it is not treated as proof that a map rendered. No indefinite spinner is used. The external search/directions and contact links remain available if an embed is blocked, offline or unavailable.

The CSP adds only `frame-src https://www.google.com`. Current structured-data script hashes, local script/style/image restrictions, `connect-src 'none'`, `form-action 'none'`, object restrictions and `frame-ancestors` are retained. Configure actual response headers on a compatible host; the `_headers` file alone does not enforce them everywhere.

The global referrer policy remains `no-referrer`. Each activated iframe uses `strict-origin-when-cross-origin` so a website-restricted key can receive the website origin without receiving full page paths or enquiry parameters. External map links retain `noopener noreferrer` and `no-referrer`. Check real response headers and iframe behaviour on the intended HTTPS origin. `frame-src` permits embedding Google; `frame-ancestors` separately governs who may embed this website.

Location data never comes from enquiry fields, analytics events or browser storage. Google handles external searches and activated maps under its policies. Removing a frame does not erase data or cookies Google already received. The public explanation is at `privacy.html#google-maps`. These controls alone do not establish legal compliance.

## Verification and maintenance

Run `node --test qa/*.test.cjs` from the source checkout or extracted ZIP. Node is needed only for developer checks. The release's configuration assertions deliberately record its current search-only state. When a real destination changes, update its expected status/evidence assertions as well as content; retain hostile-URL, activation and regression checks.

On a controlled HTTPS staging origin, check:

1. Each search result and any configured embed against the verified AGANO public location. Confirm each directions destination and do not infer correctness from code tests.
2. No Google request before activation in the Network panel; then check load, failure/blocking, removal, reactivation and back/forward behaviour.
3. Real key referrer/API restrictions with the actual CSP and global referrer headers. Do not loosen the policy to hide an error.
4. Keyboard order, skip-map links, native button activation, iframe title, focus after loading/removal, screen-reader feedback and Google attribution/controls.
5. Responsive overflow, touch targets and map sizing at 320, 375, 430, 768, 1024, 1280, 1440 and 1920 px; 200% zoom and reduced-motion preferences.
6. Chrome, Edge, Firefox and Safari, no-JavaScript fallbacks, and the existing three WhatsApp forms and site-prefill links. Do not send a real enquiry merely as a code test.

Local Chrome 155 checks verified responsive layout and navigation on the six location pages. Actual Google pins, remote embed rendering, key authentication, live WhatsApp delivery, other browsers and Lighthouse scores remain unverified. See `docs/testing-report.md` for the tests actually run. This ZIP-only update did not publish a website, change DNS or change hosting access.

## Official references checked 20 October 2026

- [Google Maps sharing and embedding](https://support.google.com/maps/answer/7101463)
- [Maps Embed API and iframe requirements](https://developers.google.com/maps/documentation/embed/embedding-map)
- [Google Maps search/directions URLs](https://developers.google.com/maps/documentation/urls/get-started)
- [Maps Platform API-key restrictions](https://developers.google.com/maps/api-security-best-practices)


Production website origin: `https://www.aganolegacyresources.co.zw`. Use that exact HTTPS origin when configuring any future website-restricted Maps Embed key. The current package still uses name/address searches; no verified pin, paid API or embed key has been enabled.

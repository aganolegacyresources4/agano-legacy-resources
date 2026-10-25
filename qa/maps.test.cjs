/* URL and controlled DOM checks. These do not contact Google or render maps. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { environment } = require('./dom-fixture.cjs');
const base = path.resolve(__dirname, '..');
const root = fs.existsSync(path.join(base, 'dist/index.html')) ? path.join(base, 'dist') : base;
const slugs = ['globe-and-phoenix', 'silobela', 'sebakwe', 'sherwood', 'head-office', 'processing-plant'];
// Synthetic URL fixtures only, not verified pins or working service credentials.
const shared = 'https://www.google.com/maps/embed?pb=synthetic-fixture-not-a-production-map';
const key = 'SYNTHETIC_FIXTURE_KEY_0123456789';
const proof = { verifiedOn: '2026-10-20', sourceUrl: 'https://example.org/public-location-record' };
function item(extra = {}) {
  return { name: 'Fixture office', searchQuery: 'Fixture office, Zimbabwe', publicAddress: 'Fixture public address',
    status: 'verified', placeId: '', embedUrl: shared, verification: { ...proof }, ...extra };
}
function api() { const e = environment(); e.load('maps'); return e.win.AGANO.maps; }
function cardUI(config) {
  const e = environment(), card = e.element('div'), nodes = {};
  card.setAttribute('data-location', 'silobela');
  for (const [name, tag] of [['frame', 'div'], ['placeholder', 'div'], ['placeholder-copy', 'p'], ['load', 'button'],
    ['remove', 'button'], ['status', 'p'], ['external', 'a'], ['directions', 'a'], ['label', 'span'], ['note', 'p']]) {
    const node = e.element(tag); node.setAttribute('data-map-' + name, ''); nodes[name] = node;
    if (['load', 'remove', 'directions'].includes(name)) node.hidden = true;
    card.append(node);
  }
  nodes.placeholder.append(nodes['placeholder-copy']);
  // append() does not emulate reparenting; remove the earlier sibling entry in the fixture.
  card.children = card.children.filter(child => child !== nodes['placeholder-copy']);
  nodes.external.href = 'https://www.google.com/maps/search/?api=1&query=Silobela%20Antimony%20Complex%2C%20Zimbabwe';
  nodes.label.textContent = 'Site name search';
  nodes.note.textContent = 'Search does not identify a confirmed visitor entrance.';
  e.doc.body.append(card);
  if (config === undefined) e.load('maps-config'); else e.win.AGANO_MAPS_CONFIG = config;
  e.load('maps'); e.win.AGANO.initMaps();
  return { ...e, card, nodes };
}
test('release configuration retains six search-only locations and the separate four-site enquiry map', () => {
  const e = environment(); e.load('site-config', 'maps-config', 'maps');
  assert.deepEqual(Object.keys(e.win.AGANO_MAPS_CONFIG.locations), slugs);
  assert.deepEqual(Object.keys(e.win.AGANO_CONFIG.sites), slugs.slice(0, 4));
  assert.equal(e.win.AGANO_MAPS_CONFIG.embedApiKey, '');
  for (const slug of slugs) {
    const current = e.win.AGANO_MAPS_CONFIG.locations[slug];
    assert.equal(current.status, 'search-only'); assert.equal(current.embedUrl, '');
    assert.equal(current.placeId, ''); assert.equal(current.verification.verifiedOn, '');
    assert.equal(e.win.AGANO.maps.configuredEmbed(e.win.AGANO_MAPS_CONFIG, current), '');
    if (slug !== 'head-office') assert.equal(current.publicAddress, '');
  }
});
test('exact Google shared embed and Maps Embed place endpoints pass syntactic validation', () => {
  const maps = api();
  assert.equal(maps.validateEmbedURL(shared), shared);
  const value = 'https://www.google.com/maps/embed/v1/place?key=' + key + '&q=place_id%3Afixture';
  assert.equal(maps.validateEmbedURL(value), value);
});
test('embed validation rejects hostile protocols, hosts, credentials, ports, paths and fragments', () => {
  const maps = api();
  for (const value of ['javascript:alert(1)', 'data:text/html,unsafe', '//www.google.com/maps/embed?pb=a',
    'http://www.google.com/maps/embed?pb=a', 'https://google.com/maps/embed?pb=a',
    'https://www.google.com.evil.test/maps/embed?pb=a', 'https://www.google.com@evil.test/maps/embed?pb=a',
    'https://evil.test@www.google.com/maps/embed?pb=a', 'https://www.google.com:443/maps/embed?pb=a',
    'https://www.google.com:8443/maps/embed?pb=a', 'https://www.google.com/maps/search/?q=a',
    'https://www.google.com/url?url=https://evil.test', shared + '#anything',
    'https://www.google.com\\@evil.test/maps/embed?pb=a', ' https://www.google.com/maps/embed?pb=a',
    'https://www.google.com/maps/embed?pb=a\n']) assert.equal(maps.validateEmbedURL(value), '', value);
});
test('embed validation rejects missing, duplicated, unknown or malformed parameters', () => {
  const maps = api(), prefix = 'https://www.google.com/maps/';
  for (const suffix of ['embed', 'embed?pb=', 'embed?pb=%20', 'embed?pb=%0A', 'embed?pb=a&pb=b',
    'embed?pb=a&redirect=https://evil.test', 'embed/v1/place?key=short&q=fixture',
    'embed/v1/place?key=' + key, 'embed/v1/place?key=' + key + '&q=',
    'embed/v1/place?key=' + key + '&q=a&q=b', 'embed/v1/place?key=' + key + '&q=a&callback=evil'])
    assert.equal(maps.validateEmbedURL(prefix + suffix), '', suffix);
});
test('a verified flag alone cannot activate an embed without verification evidence', () => {
  const maps = api();
  for (const current of [item({ status: 'search-only' }), item({ verification: null }),
    item({ verification: { verifiedOn: '', sourceUrl: '' } }),
    item({ verification: { ...proof, sourceUrl: 'javascript:alert(1)' } })])
    assert.equal(maps.configuredEmbed({}, current), '');
  assert.equal(maps.configuredEmbed({}, item()), shared);
});
test('optional API embeds need verification, a destination and a configured key', () => {
  const maps = api(), current = item({ embedUrl: '', placeId: 'fixture-id' });
  assert.equal(maps.configuredEmbed({ embedApiKey: '' }, current), '');
  assert.equal(maps.configuredEmbed({ embedApiKey: 'short' }, current), '');
  const url = new URL(maps.configuredEmbed({ embedApiKey: key }, current));
  assert.equal(url.origin, 'https://www.google.com'); assert.equal(url.pathname, '/maps/embed/v1/place');
  assert.equal(url.searchParams.get('q'), 'place_id:fixture-id');
  assert.equal(url.searchParams.get('key'), key);
  assert.equal(maps.configuredEmbed({ embedApiKey: key }, item({ embedUrl: '', publicAddress: '', placeId: '' })), '');
});
test('directions cannot turn unverified site names into destinations', () => {
  const maps = api();
  assert.equal(maps.directionsURL(item({ status: 'search-only' })), '');
  assert.equal(maps.directionsURL(item({ publicAddress: '', placeId: '' })), '');
  const url = new URL(maps.directionsURL(item({ placeId: 'fixture-id', publicAddress: '' })));
  assert.equal(url.pathname, '/maps/dir/'); assert.equal(url.searchParams.get('api'), '1');
  assert.equal(url.searchParams.get('destination_place_id'), 'fixture-id');
  assert.equal(url.searchParams.get('destination'), 'Fixture office');
});
test('search parameters encode names literally and cannot inject destinations or protocols', () => {
  const maps = api(), value = 'A &destination=evil # place 李';
  const url = new URL(maps.searchURL(item({ searchQuery: value, status: 'search-only' })));
  assert.equal(url.origin, 'https://www.google.com'); assert.equal(url.pathname, '/maps/search/');
  assert.equal(url.searchParams.get('query'), value); assert.equal([...url.searchParams.keys()].length, 2);
  assert.equal(url.hash, '');
  const verified = new URL(maps.searchURL(item({ placeId: 'fixture-id' })));
  assert.equal(verified.searchParams.get('query_place_id'), 'fixture-id');
  assert.equal(maps.searchURL(item({ searchQuery: '界'.repeat(500), status: 'search-only' })), '');
  assert.equal(maps.directionsURL(item({ publicAddress: '界'.repeat(500) })), '');
});
test('unknown, inherited and malformed records cannot initialise a map', () => {
  const maps = api(), config = { locations: { silobela: item() } };
  for (const slug of ['missing', '__proto__', 'constructor', 'toString']) assert.equal(maps.record(config, slug), null);
  assert.equal(maps.record({ locations: { silobela: {} } }, 'silobela'), null);
  const e = cardUI({ locations: {} }); assert.equal(e.nodes.load.hidden, true); assert.equal(e.nodes.frame.children.length, 0);
});
test('current search-only cards have no iframe or map controls and retain working external links', () => {
  const e = cardUI();
  assert.equal(e.nodes.frame.children.length, 0); assert.equal(e.nodes.load.hidden, true);
  assert.equal(e.nodes.remove.hidden, true); assert.equal(e.nodes.directions.hidden, true);
  assert.equal(e.nodes.placeholder.hidden, false); assert.equal(e.nodes.label.textContent, 'Site name search');
  assert.equal(new URL(e.nodes.external.href).searchParams.get('query'), 'Pagamesa mine, Gothic, Silobela, Zimbabwe');
  assert.equal(e.nodes.external.getAttribute('rel'), 'noopener noreferrer');
  assert.equal(e.nodes.external.getAttribute('referrerpolicy'), 'no-referrer');
});
test('verified cards defer iframe creation until explicit activation and reject duplicate activation', () => {
  const e = cardUI({ locations: { silobela: item() } });
  assert.equal(e.nodes.load.hidden, false); assert.equal(e.nodes.frame.children.length, 0);
  e.nodes.load.fire('click'); e.nodes.load.fire('click');
  assert.equal(e.nodes.frame.children.length, 1); const frame = e.nodes.frame.children[0];
  assert.equal(frame.tagName, 'IFRAME'); assert.equal(frame.src, shared);
  assert.equal(frame.getAttribute('title'), 'Google Map — Fixture office');
  assert.equal(frame.getAttribute('loading'), 'lazy');
  assert.equal(frame.getAttribute('referrerpolicy'), 'strict-origin-when-cross-origin');
  assert.ok(Number(frame.getAttribute('width')) >= 200); assert.ok(Number(frame.getAttribute('height')) >= 200);
  assert.equal(e.nodes.placeholder.hidden, true); assert.equal(e.nodes.load.disabled, true);
  assert.equal(e.doc.activeElement, e.nodes.remove); assert.equal(e.nodes.remove.hidden, false);
  assert.match(e.nodes.status.textContent, /requested.*blocked or unavailable/);
});
test('iframe load never claims that a cross-origin map rendered successfully', () => {
  const e = cardUI({ locations: { silobela: item() } }); e.nodes.load.fire('click');
  e.nodes.frame.children[0].fire('load');
  assert.match(e.nodes.status.textContent, /frame opened.*If the map is unavailable/);
  assert.doesNotMatch(e.nodes.status.textContent, /success|verified|rendered/i);
  assert.equal(e.nodes.external.hidden, false);
});
test('iframe errors retain a usable external link and removable frame', () => {
  const e = cardUI({ locations: { silobela: item() } }); e.nodes.load.fire('click');
  e.nodes.frame.children[0].fire('error');
  assert.match(e.nodes.status.textContent, /could not be opened.*Google Maps/);
  assert.equal(e.nodes.remove.hidden, false); assert.ok(e.nodes.external.href);
});
test('remove restores the placeholder and focus; stale callbacks cannot change the new state', () => {
  const e = cardUI({ locations: { silobela: item() } }); e.nodes.load.fire('click');
  const first = e.nodes.frame.children[0]; e.nodes.remove.fire('click');
  const message = e.nodes.status.textContent;
  assert.equal(e.nodes.frame.children.length, 0); assert.equal(e.nodes.placeholder.hidden, false);
  assert.equal(e.nodes.load.disabled, false); assert.equal(e.nodes.load.getAttribute('aria-expanded'), 'false');
  assert.equal(e.doc.activeElement, e.nodes.load); assert.equal(e.nodes.remove.hidden, true);
  first.fire('load'); first.fire('error'); assert.equal(e.nodes.status.textContent, message);
  e.nodes.load.fire('click'); assert.equal(e.nodes.frame.children.length, 1);
  assert.notEqual(e.nodes.frame.children[0], first); first.fire('load');
  assert.match(e.nodes.status.textContent, /requested/);
});
test('initialisation is idempotent and invalid embed configuration keeps the safe search fallback', () => {
  const e = cardUI({ locations: { silobela: item({ embedUrl: 'https://evil.test/embed' }) } });
  assert.equal(e.nodes.load.hidden, true); assert.equal(e.nodes.frame.children.length, 0);
  const good = cardUI({ locations: { silobela: item() } }); good.win.AGANO.initMaps();
  assert.equal(good.nodes.load.listeners.click.length, 1); assert.equal(good.nodes.remove.listeners.click.length, 1);
});
test('six static location cards keep Google searches and contact fallbacks when scripts do not run', () => {
  for (const slug of slugs) {
    const file = path.join(root, slug === 'head-office' ? 'contact.html' : slug === 'processing-plant' ? 'processing.html' : 'sites/' + slug + '.html');
    const html = fs.readFileSync(file, 'utf8');
    assert.ok(html.includes('data-location="' + slug + '"'));
    assert.ok(html.includes('id="' + (slug === 'head-office' ? 'office-map' : 'location') + '"'));
    assert.match(html, /<a[^>]*data-map-external[^>]*href="https:\/\/www\.google\.com\/maps\/search\/\?api=1&amp;query=/);
    assert.match(html, /<button[^>]*data-map-load[^>]* hidden>/);
    assert.ok(html.includes(slug === 'head-office' ? 'href="tel:+263780948702"' : slug === 'processing-plant' ? 'contact.html#enquiry' : '../contact.html?site=' + slug + '#enquiry'));
    assert.equal(/<iframe\b|rel="(?:preconnect|dns-prefetch)"|maps\.googleapis\.com\/maps\/api/i.test(html), false);
  }
  const portfolio = fs.readFileSync(path.join(root, 'operations.html'), 'utf8');
  for (const slug of slugs.slice(0, 4)) assert.ok(portfolio.includes('sites/' + slug + '.html'));
});
test('map policy adds only the exact frame origin and preserves other security boundaries', () => {
  const headers = fs.readFileSync(path.join(root, '_headers'), 'utf8');
  assert.ok(headers.includes('frame-src https://www.google.com;'));
  for (const directive of ["connect-src 'none'", "form-action 'none'", "frame-ancestors 'self'", 'geolocation=()']) assert.ok(headers.includes(directive));
  assert.equal(/\*\.google\.com|unsafe-inline|unsafe-eval/.test(headers), false);
  const css = fs.readFileSync(path.join(root, 'assets/css/maps.css'), 'utf8');
  assert.match(css, /height: clamp\(320px, 33vw, 440px\)/); assert.ok(css.includes('min-height: 200px'));
  assert.equal(/url\s*\(|@import|animation:/.test(css), false);
});

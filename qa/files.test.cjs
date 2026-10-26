/* Source-level checks; rendered accessibility and responsive layout need a real browser. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');
const base = path.resolve(__dirname, '..');
const root = fs.existsSync(path.join(base, 'dist/index.html')) ? path.join(base, 'dist') : base;
function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name); return entry.isDirectory() ? walk(file) : [file];
  });
}
const files = walk(root).filter(file => !file.includes(path.sep + 'qa' + path.sep));
const pages = files.filter(file => file.endsWith('.html')).map(file => {
  const text = fs.readFileSync(file, 'utf8'), tags = [];
  for (const match of text.matchAll(/<([a-zA-Z][\w:-]*)(\s[^<>]*?)?\s*\/?>/g)) {
    const attrs = {};
    for (const attr of (match[2] || '').matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) attrs[attr[1].toLowerCase()] = attr[2] ?? attr[3] ?? attr[4] ?? '';
    tags.push({ tag: match[1].toLowerCase(), attrs });
  }
  return { file, text, tags, ids: tags.map(tag => tag.attrs.id).filter(Boolean) };
});
test('all 32 linked pages retain language, a main landmark, one h1 and unique titles and IDs', () => {
  assert.equal(pages.length, 32); const titles = new Set();
  for (const page of pages) {
    assert.equal(page.tags.find(tag => tag.tag === 'html')?.attrs.lang, 'en', page.file);
    assert.equal(page.tags.filter(tag => tag.tag === 'main').length, 1, page.file);
    assert.equal(page.tags.filter(tag => tag.tag === 'h1').length, 1, page.file);
    assert.equal(new Set(page.ids).size, page.ids.length, page.file);
    const title = page.text.match(/<title>([^<]+)<\/title>/)?.[1]; assert.ok(title); assert.equal(titles.has(title), false); titles.add(title);
  }
});
test('all local image, stylesheet, script and navigation targets and fragment IDs exist', t => {
  let references = 0;
  const pageMap = new Map(pages.map(page => [page.file, page]));
  function check(value, origin) {
    if (!value || /^(?:https?:|mailto:|tel:|data:)/i.test(value)) return;
    assert.equal(/^(?:javascript:|vbscript:)/i.test(value), false);
    const [beforeHash, hash] = value.split('#'), local = beforeHash.split('?')[0];
    const destination = local ? path.resolve(path.dirname(origin.file), decodeURIComponent(local)) : origin.file;
    assert.ok(destination.startsWith(root + path.sep), value);
    assert.ok(fs.existsSync(destination), origin.file + ' → ' + value);
    if (hash && pageMap.has(destination)) assert.ok(pageMap.get(destination).ids.includes(decodeURIComponent(hash)), value);
    assert.notEqual(value, '#'); references++;
  }
  for (const page of pages) for (const node of page.tags) {
    if (node.attrs.href !== undefined) check(node.attrs.href, page);
    if (node.attrs.src !== undefined) check(node.attrs.src, page);
    if (node.attrs.srcset) for (const value of node.attrs.srcset.split(',')) check(value.trim().split(/\s+/)[0], page);
  }
  assert.ok(references > 1400);
  t.diagnostic(references + ' local file/fragment references checked.');
});
test('form guidance and all explicit accessibility references point to existing page IDs', () => {
  for (const page of pages) for (const node of page.tags) {
    for (const name of ['for', 'aria-controls', 'aria-describedby', 'aria-labelledby']) {
      if (!node.attrs[name]) continue;
      for (const id of node.attrs[name].split(/\s+/)) assert.ok(page.ids.includes(id), page.file + ' → ' + id);
    }
  }
  for (const filename of ['contact.html', 'procurement.html', 'careers.html']) {
    const page = pages.find(item => item.file === path.join(root, filename));
    assert.ok(page.text.includes('data-error-summary')); assert.ok(page.text.includes('data-character-count'));
    assert.ok(page.text.includes('data-message-review')); assert.ok(page.text.includes('maxlength="1000"'));
  }
});
test('classic scripts load in dependency order and optional features load only where used', () => {
  for (const page of pages) {
    const scripts = page.tags.filter(tag => tag.tag === 'script' && tag.attrs.src);
    const feature = name => page.tags.some(tag => name in tag.attrs);
    const names = ['site-config', 'navigation', 'contact'];
    if (feature('data-filter-list')) names.push('filters');
    if (feature('data-lightbox')) names.push('gallery');
    if (feature('data-enquiry-form')) names.push('forms');
    if (feature('data-location')) names.push('maps-config', 'maps');
    names.push('effects', 'main');
    if (page.ids.includes('mine-canvas')) names.push('homepage-video');
    assert.deepEqual(scripts.map(tag => path.basename(tag.attrs.src.split('?')[0], '.js')), names);
    for (const script of scripts) { assert.ok('defer' in script.attrs); assert.notEqual(script.attrs.type, 'module'); }
  }
  const js = files.filter(file => file.endsWith('.js') && file.includes(path.sep + 'assets' + path.sep));
  assert.equal(js.length, 11);
  for (const file of js) {
    const text = fs.readFileSync(file, 'utf8'); assert.doesNotThrow(() => new vm.Script(text));
    assert.equal(/\b(?:fetch|eval)\s*\(|\b(?:localStorage|sessionStorage)\b|\.innerHTML\s*=/.test(text), false, file);
  }
});
test('security policy still covers every structured-data block without broad inline permissions', () => {
  const headers = fs.readFileSync(path.join(root, '_headers'), 'utf8');
  assert.ok(headers.includes("connect-src 'none'")); assert.ok(headers.includes("form-action 'none'"));
  assert.equal(headers.includes('unsafe-inline'), false); assert.equal(headers.includes('unsafe-eval'), false);
  for (const page of pages) {
    assert.equal(/\son[a-z]+\s*=/i.test(page.text), false, page.file);
    assert.equal(/\sstyle\s*=/i.test(page.text), false, page.file);
    for (const match of page.text.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      assert.doesNotThrow(() => JSON.parse(match[1]));
      const digest = crypto.createHash('sha256').update(match[1]).digest('base64');
      assert.ok(headers.includes("'sha256-" + digest + "'"), page.file);
    }
  }
});
test('critical content is never gated by an effects class and reduced-motion and print rules exist', () => {
  const css = fs.readFileSync(path.join(root, 'assets/css/effects.css'), 'utf8');
  assert.ok(css.includes('prefers-reduced-motion: reduce')); assert.ok(css.includes('@media print'));
  assert.equal(/opacity\s*:\s*0(?:[;}\s])/.test(css), false);
  for (const page of pages) {
    const main = page.tags.find(tag => tag.tag === 'main'); assert.equal('hidden' in main.attrs, false);
    const content = page.tags.filter(tag => ['h1', 'h2', 'article'].includes(tag.tag));
    assert.equal(content.some(tag => 'hidden' in tag.attrs), false);
  }
});
test('home hero remains high-priority and image dimensions and gallery fallbacks are present', () => {
  const home = pages.find(page => path.basename(page.file) === 'index.html');
  const hero = home.tags.find(tag => tag.tag === 'img' && tag.attrs.fetchpriority === 'high');
  assert.ok(hero); assert.equal(hero.attrs.loading, undefined);
  for (const page of pages) for (const tag of page.tags.filter(tag => tag.tag === 'img')) {
    assert.ok('alt' in tag.attrs, page.file); assert.ok(Number(tag.attrs.width) > 0, page.file); assert.ok(Number(tag.attrs.height) > 0, page.file);
  }
  const gallery = pages.find(page => path.basename(page.file) === 'gallery.html');
  assert.equal(gallery.tags.filter(tag => tag.tag === 'a' && 'data-lightbox' in tag.attrs && tag.attrs.href).length, 8);
  assert.ok(fs.existsSync(path.join(root, 'assets/icons/whatsapp.svg')));
});
test('sitemap includes 31 content URLs and excludes the error page', () => {
  const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
  assert.equal([...sitemap.matchAll(/<loc>/g)].length, 31); assert.equal(sitemap.includes('/404.html'), false);
});
test('provided contact details are present as static fallbacks on every page', () => {
  for (const page of pages) {
    assert.ok(page.text.includes('1, Ward 8, Sebakwe Bloke, Kwekwe, Zimbabwe'), page.file);
    assert.ok(page.text.includes('tel:+263780948702'), page.file);
    assert.ok(page.text.includes('mailto:info@aganolegacyresources.co.zw'), page.file);
    assert.equal(/aria-current="page"\s+aria-current="page"/.test(page.text), false);
  }
});
test('four site profiles are linked from the portfolio and have direct enquiry context', () => {
  const slugs = ['globe-and-phoenix', 'silobela', 'sebakwe', 'sherwood'];
  const portfolio = pages.find(page => page.file === path.join(root, 'projects.html'));
  for (const slug of slugs) {
    assert.ok(portfolio.text.includes('sites/' + slug + '.html'));
    const profile = pages.find(page => page.file === path.join(root, 'sites', slug + '.html'));
    assert.ok(profile); assert.ok(profile.text.includes('../contact.html?site=' + slug + '#enquiry'));
  }
});

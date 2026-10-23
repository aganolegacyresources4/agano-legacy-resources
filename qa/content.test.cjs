/* Release-content checks use the shipped HTML and public configuration. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const base = path.resolve(__dirname, '..');
const root = fs.existsSync(path.join(base, 'dist/index.html')) ? path.join(base, 'dist') : base;
const html = name => fs.readFileSync(path.join(root, name), 'utf8');
const main = name => html(name).match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1];
function files(dir) { return fs.readdirSync(dir, { withFileTypes: true }).flatMap(x => x.isDirectory() ? files(path.join(dir, x.name)) : [path.join(dir, x.name)]); }
const pages = files(root).filter(x => x.endsWith('.html'));
function configuration() {
  const context = vm.createContext({ window: {}, URL, URLSearchParams, console });
  for (const name of ['site-config', 'maps-config', 'forms']) vm.runInContext(fs.readFileSync(path.join(root, 'assets/js/' + name + '.js'), 'utf8'), context);
  return context.window;
}
const names = {
  'globe-and-phoenix': 'LonRho Gold & Antimony Mine',
  'sebakwe': 'Anzac Antimony Mine',
  'sherwood': 'Sherwood Block Gold Mine',
  'silobela': 'Pagamesa Antimony Mine'
};
test('the four retained profile slugs use the latest company-supplied mine identities', () => {
  const config = configuration().AGANO_CONFIG;
  assert.equal(Object.keys(config.sites).length, 4);
  for (const [slug, name] of Object.entries(names)) {
    assert.equal(config.sites[slug], name);
    assert.ok(main('sites/' + slug + '.html').includes(name.replaceAll('&', '&amp;')));
  }
  const portfolio = main('projects.html');
  const sequence = ['LonRho Gold &amp; Antimony Mine', 'Anzac Antimony Mine', 'Sherwood Block Gold Mine', 'Pagamesa Antimony Mine'];
  assert.ok(sequence.every((name, i) => i === 0 || portfolio.indexOf(sequence[i - 1]) < portfolio.indexOf(name)));
});
test('homepage contains the supplied team, four-mine footprint, story and antimony-first focus', () => {
  const body = main('index.html');
  for (const phrase of ['300', 'RIFA', 'antimony', 'gold', 'Four mines', 'processing.html', 'gallery.html']) assert.ok(body.includes(phrase), phrase);
  assert.match(body, /<strong>4<\/strong>/);
  assert.match(body, /<strong>1<\/strong>/);
  assert.equal(body.includes('Not an AGANO property'), false);
});
test('the full company story preserves heritage, resilience, stewardship and generational purpose', () => {
  const body = main('about.html');
  for (const phrase of ['From the foundations of RIFA', 'faith in Zimbabwean capability', 'restore discipline, rebuild trust', 'statutory compliance', 'fair and sustainable livelihoods', 'Zimbabwe’s industrial capability', 'those who come after us']) assert.ok(body.includes(phrase), phrase);
  assert.match(body, /id="our-story"/); assert.match(body, /id="governance"/);
});
test('LonRho grades and current workings preserve the supplied units and reporting context', () => {
  const body = main('sites/globe-and-phoenix.html');
  for (const phrase of ['10 g/t', '35–45% Sb', '44 m', 'Level 2', 'Globe &amp; Phoenix', 'company-reported', 'reserve estimate'])
    assert.ok(body.toLowerCase().includes(phrase.toLowerCase()) || phrase === 'company-reported' && body.includes('Company-supplied operational information'), phrase);
});
test('Anzac distinguishes the observed reef from the target and excludes the ambiguous shaft measure', () => {
  const body = main('sites/sebakwe.html');
  assert.ok(body.includes('18 metres')); assert.ok(body.includes('target depth of 60 metres'));
  assert.ok(body.includes('Jojo')); assert.ok(body.includes('north of Kwekwe'));
  assert.equal(/25\s*(?:%|m\b|metres)/i.test(body), false);
});
test('Pagamesa is the fourth mine and stibnite content is not relabelled as an Sb assay', () => {
  const body = main('sites/silobela.html');
  for (const phrase of ['three shafts', '28%', 'stibnite', 'Fortuna', 'Gothic', 'Stronghold']) assert.ok(body.includes(phrase), phrase);
  assert.equal(/28%\s*Sb/.test(body), false); assert.ok(body.includes('28% Stibnite'));
});
test('Sherwood uses the latest greenstone-belt description and both supplied mining approaches', () => {
  const body = main('sites/sherwood.html');
  for (const phrase of ['Archean Midlands greenstone belt', 'Zimbabwe Craton', 'Sherwood Deformation Zone', 'deep-level shaft', 'open-cast']) assert.ok(body.includes(phrase), phrase);
  assert.equal(body.includes('Great Dyke'), false);
});
test('the plant is separate from the four mines and its four process stages retain their order', () => {
  const body = main('processing.html'), app = configuration();
  const sequence = body.match(/<ol class="process-grid">([\s\S]*?)<\/ol>/)[1];
  const stages = ['Gravity concentration', 'Alkaline leaching', 'Electrowinning', 'Smelting'];
  assert.ok(stages.every((stage, i) => i === 0 || sequence.indexOf(stages[i - 1]) < sequence.indexOf(stage)));
  for (const slug of ['silobela', 'sebakwe', 'globe-and-phoenix']) assert.ok(body.includes('sites/' + slug + '.html'));
  assert.equal(app.AGANO_MAPS_CONFIG.locations['processing-plant'].kind, 'facility');
  assert.equal(app.AGANO_CONFIG.sites['processing-plant'], undefined);
  assert.ok(body.includes('designed to produce antimony concentrate'));
});
test('office hours match the supplied days in visible copy, public configuration and structured data', () => {
  const body = main('contact.html'), app = configuration();
  assert.ok(body.includes('id="office-hours"')); assert.ok(body.includes('UTC+2'));
  for (const value of ['08:00', '18:00', '16:00', '09:00', '13:00']) assert.ok(body.includes('datetime="' + value + '"'));
  assert.equal(app.AGANO_CONFIG.officeTimeZone, 'Africa/Harare');
  assert.ok(app.AGANO_CONFIG.businessHours.includes('Sunday: 9:00 am–1:00 pm'));
  assert.equal(/Saturday.*closed/i.test(body), false);
  const org = [...html('contact.html').matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(x => JSON.parse(x[1])).find(x => x['@type'] === 'Organization');
  assert.deepEqual(org.contactPoint.hoursAvailable.map(x => [x.dayOfWeek, x.opens, x.closes]), [
    [['Monday', 'Tuesday', 'Wednesday', 'Thursday'], '08:00', '18:00'], [['Friday'], '08:00', '16:00'], [['Sunday'], '09:00', '13:00']
  ]);
});
test('all 32 pages use the actual logo, office-hours fallback and linked processing page', () => {
  for (const file of pages) {
    const text = fs.readFileSync(file, 'utf8');
    assert.equal([...text.matchAll(/class="wordmark logo-lockup"/g)].length, 2, file);
    assert.ok(text.includes('agano-logo-160.webp'), file);
    assert.ok(text.includes('contact.html#office-hours'), file);
    assert.ok(text.includes('processing.html'), file);
    assert.ok(text.includes('Sunday: 9:00 am–1:00 pm'), file);
    assert.equal(text.includes('Globe and Phoenix Antimony/Gold Complex'), false, file);
    assert.equal(text.includes('Silobela Antimony Complex'), false, file);
  }
  assert.equal(fs.readFileSync(path.join(root, 'favicon.png')).subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.equal(fs.readFileSync(path.join(root, 'favicon.ico')).subarray(0, 4).toString('hex'), '00000100');
});
test('all eight supplied views have accessible gallery entries and real responsive WebP derivatives', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(base, 'docs/company-image-manifest.json'), 'utf8'));
  const body = main('gallery.html');
  assert.equal(manifest.images.length, 8); assert.equal([...body.matchAll(/data-lightbox\b/g)].length, 8);
  assert.ok(body.includes('digitally enhanced imagery'));
  for (const image of manifest.images) {
    const small = image.variants[0], large = image.variants.at(-1);
    assert.ok(body.includes('href="' + large.file + '"'));
    assert.ok(body.includes('src="' + small.file + '"'));
    assert.ok(body.includes(image.alt)); assert.ok(small.width <= 640);
    for (const v of image.variants) {
      const bytes = fs.readFileSync(path.join(root, v.file));
      assert.equal(bytes.subarray(0, 4).toString(), 'RIFF'); assert.equal(bytes.subarray(8, 12).toString(), 'WEBP');
      assert.equal(bytes.length, v.bytes); assert.ok(v.width > 0 && v.height > 0);
    }
  }
});
test('all six location cards match public configuration without enabling unverified exact directions', () => {
  const app = configuration();
  const locations = app.AGANO_MAPS_CONFIG.locations;
  assert.equal(Object.values(locations).filter(x => x.kind === 'site').length, 4);
  assert.equal(Object.values(locations).filter(x => x.kind === 'office').length, 1);
  assert.equal(Object.values(locations).filter(x => x.kind === 'facility').length, 1);
  for (const [slug, record] of Object.entries(locations)) {
    const filename = slug === 'head-office' ? 'contact.html' : slug === 'processing-plant' ? 'processing.html' : 'sites/' + slug + '.html';
    const body = main(filename);
    const url = body.match(/data-map-external[^>]*href="([^"]+)"/)[1].replaceAll('&amp;', '&');
    assert.equal(new URL(url).searchParams.get('query'), record.searchQuery);
    assert.equal(record.status, 'search-only'); assert.equal(record.embedUrl, ''); assert.equal(record.placeId, '');
    assert.match(body, /data-map-directions[^>]*\shidden>/); assert.equal(/<iframe\b/.test(body), false);
  }
});
test('current mine names can enter bounded reviewed messages while all enquiry types retain the AGANO recipient', () => {
  const app = configuration(), valid = { name:'Test Person', company:'Test Organisation', email:'test@example.org', phone:'', message:'A non-confidential request for information about the mine.', privacy:true, website:'' };
  for (const name of Object.values(names)) {
    const result = app.AGANO.whatsapp.prepare({ ...valid, kind:'general', category:'Mining operations', subject:'Site enquiry: ' + name }, 'general', app.AGANO_CONFIG);
    assert.equal(Object.keys(result.errors).length, 0);
    const url = new URL(result.url); assert.equal(url.origin, 'https://wa.me'); assert.equal(url.pathname, '/263780948702');
    assert.ok(url.searchParams.get('text').includes(name)); assert.equal(url.searchParams.get('text'), result.message);
  }
});

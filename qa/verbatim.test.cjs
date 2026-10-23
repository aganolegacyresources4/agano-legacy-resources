/* Compare rendered-copy text against the words supplied by the client. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = path.resolve(__dirname, '..');
const root = fs.existsSync(path.join(base, 'dist/index.html')) ? path.join(base, 'dist') : base;
const copy = JSON.parse(fs.readFileSync(path.join(base, 'docs/verbatim-content.json'), 'utf8'));
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
function plain(text) {
  return text.replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
}
function check(name, keys) {
  const html = read(name);
  for (const key of keys) {
    const expression = new RegExp('<(p|div|h[1-6])\\b[^>]*data-verbatim="' + key + '"[^>]*>([\\s\\S]*?)<\\/\\1>', 'g');
    const matches = [...html.matchAll(expression)];
    assert.equal(matches.length, 1, name + ': ' + key + ' must appear once');
    assert.equal(plain(matches[0][2]), plain(copy[key]), name + ': ' + key + ' wording changed');
  }
}
test('the homepage contains every complete supplied passage and heading without paraphrasing', () => {
  check('index.html', Object.keys(copy).filter(key => !['instruction','received'].includes(key)));
});
test('About and Operations retain the complete original corporate overview and story', () => {
  check('about.html', ['company','story']);
  check('operations.html', ['company']);
});
test('the Minerals page retains both full original paragraphs and its supplied title', () => {
  check('minerals.html', ['minerals_origin','minerals_focus','minerals_title']);
});
test('the linked mine and processing profiles retain the original words and titles', () => {
  for (const [page,key] of [['sites/globe-and-phoenix.html','lonrho'],['sites/silobela.html','pagamesa'],['sites/sherwood.html','sherwood'],['processing.html','processing']]) {
    check(page, [key,key+'_title',...(['lonrho','pagamesa'].includes(key)?[key+'_country']:[])]);
  }
});
test('all production pages allow browser zoom while opting into safe-area layout', () => {
  function walk(dir) { return fs.readdirSync(dir,{withFileTypes:true}).flatMap(x=>x.isDirectory()?walk(path.join(dir,x.name)):[path.join(dir,x.name)]); }
  for (const file of walk(root).filter(x=>x.endsWith('.html'))) {
    const tag=fs.readFileSync(file,'utf8').match(/<meta name="viewport"[^>]*>/)?.[0];
    assert.ok(tag,file); assert.ok(tag.includes('viewport-fit=cover'),file);
    assert.equal(/maximum-scale|user-scalable/i.test(tag),false,file);
  }
});

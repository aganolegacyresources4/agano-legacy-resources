/* File budgets are measured locally; they do not assert network timings or Core Web Vitals. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const base = path.resolve(__dirname, '..');
const root = fs.existsSync(path.join(base, 'dist/index.html')) ? path.join(base, 'dist') : base;
function walk(dir) { return fs.readdirSync(dir, {withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]); }
const pages = walk(root).filter(f=>f.endsWith('.html')&&!f.includes(path.sep+'qa'+path.sep));
test('every page stays within the initial CSS and JavaScript compression budget', () => {
  for (const file of pages) {
    const html = fs.readFileSync(file, 'utf8');
    const assets = [...html.matchAll(/(?:href|src)="([^"]+\.(?:css|js))(?:\?[^\"]*)?"/g)].map(m=>path.resolve(path.dirname(file),m[1]));
    const bytes = [...new Set(assets)].reduce((n,f)=>n+zlib.gzipSync(fs.readFileSync(f)).length,0);
    assert.ok(bytes <= 100*1024, path.relative(root,file)+' '+bytes+' bytes');
  }
});
test('homepage does not preload the obsolete hero and offers an intermediate responsive source', () => {
  const html = fs.readFileSync(path.join(root,'index.html'),'utf8');
  assert.equal(/rel="preload"[^>]*hero-1920/.test(html),false);
  assert.ok(html.includes('mine-at-sunset-960.webp 960w'));
  const img=html.match(/<img[^>]*fetchpriority="high"[^>]*>/)?.[0];
  assert.ok(img); assert.equal(/loading="lazy"/.test(img),false);
  assert.ok(fs.statSync(path.join(root,'assets/images/company/mine-at-sunset-960.webp')).size<250*1024);
  assert.ok(fs.statSync(path.join(root,'assets/images/company/mine-at-sunset-1536.webp')).size<450*1024);
});
test('eight small gallery thumbnails meet their budget while full-size links retain their own assets', () => {
  const data=JSON.parse(fs.readFileSync(path.join(base,'docs/company-image-manifest.json'),'utf8'));
  const html=fs.readFileSync(path.join(root,'gallery.html'),'utf8');
  for (const image of data.images) {
    const thumb=image.variants[0],large=image.variants.at(-1);
    assert.equal(thumb.role,'gallery-thumbnail'); assert.equal(thumb.width,480); assert.equal(thumb.height,360);
    assert.ok(thumb.bytes<=80*1024,image.key); assert.notEqual(thumb.file,large.file);
    assert.ok(html.includes('src="'+thumb.file+'"')); assert.ok(html.includes('href="'+large.file+'"'));
  }
});
test('only the gallery carries a lightbox and its optional controller', () => {
  for (const file of pages) {
    const html=fs.readFileSync(file,'utf8'), gallery=path.basename(file)==='gallery.html';
    assert.equal(html.includes('<dialog class="lightbox"'),gallery,file);
    assert.equal(/src="[^\"]*assets\/js\/gallery\.js/.test(html),gallery,file);
  }
});
test('new enquiry and preview textareas do not start with indentation counted as visitor input', () => {
  for (const name of ['contact.html','careers.html','procurement.html']) {
    const html=fs.readFileSync(path.join(root,name),'utf8');
    for (const match of html.matchAll(/<textarea\b[^>]*>([\s\S]*?)<\/textarea>/g)) assert.equal(match[1],'',name);
  }
});
test('every static header preserves a usable no-script navigation and a properly labelled enhancement', () => {
  for (const file of pages) {
    const html=fs.readFileSync(file,'utf8');
    const nav=html.match(/<nav class="site-nav"[^>]*>/)?.[0];
    const toggle=html.match(/<button class="nav-toggle"[^>]*>/)?.[0];
    assert.ok(nav); assert.equal(/\bhidden\b/.test(nav),false);
    assert.ok(toggle.includes('type="button"')); assert.ok(toggle.includes('aria-label="Main menu"'));
    assert.ok(toggle.includes('aria-controls="primary-nav"')); assert.ok(/\bhidden\b/.test(toggle));
    assert.ok(html.includes('<ul class="nav-list">')); assert.ok(html.includes('<ul class="nav-dropdown">'));
    assert.equal(/role="(?:menu|menubar)"/.test(nav),false);
  }
});
test('the applied palette keeps body, emphasis and control-boundary combinations readable', () => {
  const css=fs.readFileSync(path.join(root,'assets/css/main.css'),'utf8');
  const variables=Object.fromEntries([...css.matchAll(/(--[\w-]+):\s*([^;\n}]+)/g)].map(m=>[m[1],m[2].trim()]));
  function colour(name) { const value=variables[name]; if(value.startsWith('var('))return colour(value.slice(4,-1)); return value; }
  function luminance(value) {
    assert.match(value,/^#[a-f\d]{6}$/i);
    const c=[1,3,5].map(i=>parseInt(value.slice(i,i+2),16)/255).map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4);
    return c[0]*.2126+c[1]*.7152+c[2]*.0722;
  }
  function ratio(a,b) { const c=[luminance(colour(a)),luminance(colour(b))].sort((x,y)=>x-y);return(c[1]+.05)/(c[0]+.05); }
  for(const pair of [['--ink','--paper'],['--ink','--gold'],['--muted','--paper'],['--gold-dark','--paper'],['--white','--navy']])assert.ok(ratio(...pair)>=4.5,pair.join('/'));
  assert.ok(ratio('--control-line','--white')>=3); assert.ok(ratio('--steel-blue-dark','--paper')>=3);
});

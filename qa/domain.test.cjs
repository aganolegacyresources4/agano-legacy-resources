/* Production-origin regressions: no network or DNS assumptions. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const base=path.resolve(__dirname,'..');
const root=fs.existsSync(path.join(base,'dist/index.html'))?path.join(base,'dist'):base;
const origin='https://www.aganolegacyresources.co.zw';
function walk(dir) { return fs.readdirSync(dir,{withFileTypes:true}).flatMap(x=>x.isDirectory()?walk(path.join(dir,x.name)):[path.join(dir,x.name)]); }
const pages=walk(root).filter(x=>x.endsWith('.html')&&!/\/(?:qa|docs)\//.test(x));
const read=file=>fs.readFileSync(file,'utf8');
test('all 32 canonical and social page URLs use the selected www HTTPS origin and retained path',()=>{
  assert.equal(pages.length,32);
  for(const file of pages) {
    const html=read(file), relative=path.relative(root,file).split(path.sep).join('/');
    const expected=origin+'/'+(relative==='index.html'?'':relative);
    assert.equal(html.match(/<link rel="canonical" href="([^"]+)"/)[1],expected,relative);
    assert.equal(html.match(/<meta property="og:url" content="([^"]+)"/)[1],expected,relative);
    const image=html.match(/<meta property="og:image" content="([^"]+)"/);
    assert.ok(image,relative);assert.equal(new URL(image[1]).origin,origin,relative);
  }
});
test('robots and sitemap advertise exactly the content-page URLs at the selected production origin',()=>{
  const urls=[...read(path.join(root,'sitemap.xml')).matchAll(/<loc>([^<]+)<\/loc>/g)].map(x=>x[1]);
  const expected=pages.filter(f=>path.basename(f)!=='404.html').map(f=>origin+'/'+(path.relative(root,f)==='index.html'?'':path.relative(root,f).split(path.sep).join('/')));
  assert.equal(urls.length,31);assert.deepEqual([...urls].sort(),expected.sort());
  assert.ok(read(path.join(root,'robots.txt')).includes('Sitemap: '+origin+'/sitemap.xml'));
});
test('all structured-data website references use the production origin and every exact script hash is allowed',()=>{
  const headers=read(path.join(root,'_headers')),hashes=new Set();
  function verify(value) {
    if(Array.isArray(value)){value.forEach(verify);return;}
    if(value&&typeof value==='object'){Object.values(value).forEach(verify);return;}
    if(typeof value==='string'&&/^https?:\/\//.test(value)) {
      const parsed=new URL(value);
      if(parsed.hostname!=='schema.org') assert.equal(parsed.origin,origin,value);
    }
  }
  for(const file of pages) for(const match of read(file).matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    verify(JSON.parse(match[1]));
    const digest=crypto.createHash('sha256').update(match[1]).digest('base64');hashes.add(digest);
    assert.ok(headers.includes("'sha256-"+digest+"'"),file);
  }
  assert.equal(hashes.size,4);
});
test('public text has no preview-host URLs and framing remains restricted to this website',()=>{
  for(const file of walk(root).filter(x=>!/[\\/](?:qa|docs|scripts)[\\/]/.test(x)&&(/\.(?:html|js|css|json|xml|txt)$/.test(x)||path.basename(x)==='_headers'))) {
    assert.equal(/https?:\/\/[^\s"'<>]*\.chatgpt\.site\b/i.test(read(file)),false,file);
  }
  const headers=read(path.join(root,'_headers'));
  assert.match(headers,/frame-ancestors 'self'\s*(?:\n|$)/);
  assert.equal(/unsafe-inline|unsafe-eval/.test(headers),false);
});

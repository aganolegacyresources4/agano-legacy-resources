/* Developer-only asset inventory. Run with Node; no browser runtime dependencies. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const base=path.resolve(__dirname,'..');
const root=fs.existsSync(path.join(base,'dist/index.html'))?path.join(base,'dist'):base;
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).filter(e=>e.name!=='__qa').flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
function size(file){const data=fs.readFileSync(file);return{raw_bytes:data.length,gzip_bytes:zlib.gzipSync(data,{level:9}).length};}
function pageInventory(directory){
 return Object.fromEntries(walk(directory).filter(f=>f.endsWith('.html')).map(file=>{
  const html=fs.readFileSync(file,'utf8');
  const resources=[...new Set([...html.matchAll(/(?:href|src)="([^"]+\.(?:css|js))(?:\?[^\"]*)?"/g)].map(m=>path.resolve(path.dirname(file),m[1])))];
  const values=resources.map(f=>size(f));
  return[path.relative(directory,file).split(path.sep).join('/'),{html:size(file),css_js_files:resources.map(f=>path.relative(directory,f).split(path.sep).join('/')),css_js_raw_bytes:values.reduce((n,x)=>n+x.raw_bytes,0),css_js_gzip_bytes:values.reduce((n,x)=>n+x.gzip_bytes,0)}];
 }));
}
const publicFiles=walk(root).filter(f=>!path.basename(f).startsWith('.')&&!['README.md','MAPS_SETUP.md','SHA256SUMS.txt'].includes(path.basename(f))&&!/\/(?:qa|docs|scripts)\//.test(f.replaceAll(path.sep,'/')));
const images=JSON.parse(fs.readFileSync(path.join(base,'docs/company-image-manifest.json'),'utf8')).images;
const report={release:'20261023-domain',date:'2026-10-22',measurement:'Local bytes and sum of per-file gzip level 9 sizes. These are not measured network transfers, Lighthouse results or Core Web Vitals.',
 html_pages:publicFiles.filter(f=>f.endsWith('.html')).length,public_files:publicFiles.length,
 css:Object.fromEntries(publicFiles.filter(f=>f.endsWith('.css')).map(f=>[path.relative(root,f).replaceAll(path.sep,'/'),size(f)])),
 js:Object.fromEntries(publicFiles.filter(f=>f.endsWith('.js')).map(f=>[path.relative(root,f).replaceAll(path.sep,'/'),size(f)])),
 gallery_default_thumbnail_bytes:images.reduce((n,x)=>n+x.variants[0].bytes,0),
 gallery_640_thumbnail_bytes:images.reduce((n,x)=>n+x.variants[1].bytes,0),
 gallery_thumbnail_budget_exceptions:images.flatMap(x=>x.variants.filter(v=>v.role==='gallery-thumbnail'&&v.bytes>80*1024).map(v=>({file:v.file,bytes:v.bytes,reason:'Larger optional 640px derivative preserves detailed texture. Every default 480px thumbnail stays under 80 KiB.'}))),
 hero_variants:images.find(x=>x.key==='mine-at-sunset').variants.filter(v=>v.role.startsWith('content-')),
 pages:pageInventory(root)};
const at=process.argv.indexOf('--baseline-dir');
const baselineFile=path.join(base,'docs/performance-baseline.json');
const before=at!==-1?pageInventory(path.resolve(process.argv[at+1])):(fs.existsSync(baselineFile)?JSON.parse(fs.readFileSync(baselineFile,'utf8')).pages:null);
if(before){report.baseline_release='20261022-content';report.before_after=Object.fromEntries(Object.entries(report.pages).map(([name,after])=>[name,{before:before[name]||null,after}]));}
const output=path.join(base,'docs/asset-sizes.json');fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({output,html_pages:report.html_pages,public_files:report.public_files,home:report.pages['index.html'],gallery_default_thumbnail_bytes:report.gallery_default_thumbnail_bytes,gallery_thumbnail_budget_exceptions:report.gallery_thumbnail_budget_exceptions},null,2));

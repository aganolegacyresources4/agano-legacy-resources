/* Prepare a temporary local-only harness. Do not deploy __qa. */
'use strict';
const fs=require('node:fs'),path=require('node:path');
const base=path.resolve(__dirname,'..');
const web=fs.existsSync(path.join(base,'dist/index.html'))?path.join(base,'dist'):base;
const target=path.join(web,'__qa');
fs.mkdirSync(target,{recursive:true});
for(const file of ['browser-harness.htm','harness.css','harness.js'])fs.copyFileSync(path.join(base,'qa/browser',file),path.join(target,file));
console.log('Internal responsive harness prepared at __qa/browser-harness.htm. Use a local preview, then remove __qa before release.');

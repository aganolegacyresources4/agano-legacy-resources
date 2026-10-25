const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const sourceRoot = path.resolve(__dirname, '..');
const root = fs.existsSync(path.join(sourceRoot, 'dist', 'index.html')) ? path.join(sourceRoot, 'dist') : sourceRoot;
function load(extra={}) {
  const context=vm.createContext({window:{},console,...extra});
  vm.runInContext(fs.readFileSync(path.join(root,'assets/js/forms.js'),'utf8'),context);
  return context;
}
const API=load().window.AGANO.whatsapp;
const valid={kind:'general',name:'Test Person',company:'Business',email:'person@business.test',phone:'+263 77 000 0000',category:'General enquiry',subject:'Partnership discussion',message:'A non-confidential introduction to a business opportunity.',privacy:true,website:''};
class Element {
  constructor(){this.attrs={};this.dataset={};this.listeners={};this.textContent='';this.value='';this.hidden=true;this.disabled=true;this.focused=0;}
  setAttribute(k,v){this.attrs[k]=v;}
  getAttribute(k){return k==='href'?(this.href||null):(this.attrs[k]||null);}
  removeAttribute(k){delete this.attrs[k];if(k==='href')delete this.href;}
  addEventListener(k,f){this.listeners[k]=f;}
  focus(){this.focused++;}
  select(){this.selected=true;}
  after(){}
}
function ui(payload=valid){
  let network=0,automaticOpen=0,resets=0,copied='';
  const selectors={};
  for(const s of ['[data-form-fields]','[data-submit]','[data-form-status]','[data-message-review]','[data-message-preview]','[data-whatsapp-continue]','[data-routing-note]','[data-copy-status]','[data-edit-message]','[data-copy-message]'])selectors[s]=new Element();
  const name=new Element();name.id='general-name';
  const privacy=new Element();privacy.checked=true;selectors['[name=privacy]']=privacy;
  const form=new Element();form.dataset.kind='general';form.querySelector=s=>selectors[s]||null;form.querySelectorAll=()=>[];form.reportValidity=()=>true;form.reset=()=>resets++;form.elements={namedItem:key=>key==='name'?name:null};
  const context=load({window:{AGANO_CONFIG:{whatsapp:''},isSecureContext:true},document:{querySelectorAll:()=>[form],createElement:()=>new Element()},navigator:{clipboard:{writeText:async text=>{copied=text;}}},FormData:class{*[Symbol.iterator](){yield*Object.entries(payload);}},fetch:()=>{network++;throw Error('unexpected network');}});
  context.window.open=()=>automaticOpen++;
  context.window.AGANO.initForms();
  return {form,selectors,name,context,get network(){return network;},get opens(){return automaticOpen;},get resets(){return resets;},get copied(){return copied;},submit(){form.listeners.submit({preventDefault(){}});}};
}
test('32 complete pages exist without framework or build entry files',()=>{
  const count=fs.readdirSync(root).filter(n=>n.endsWith('.html')).length+['news','sites'].reduce((total,folder)=>total+fs.readdirSync(path.join(root,folder)).filter(n=>n.endsWith('.html')).length,0);
  assert.equal(count,32);for(const n of ['package.json','node_modules','app','server','vite.config.ts'])assert.equal(fs.existsSync(path.join(root,n)),false);
});
test('classic scripts initialise without module loading, fetch or automatic navigation',()=>{
  let calls=0,warnings=0;const el=()=>({setAttribute(){},append(){},dataset:{}});
  const context=vm.createContext({window:{location:{pathname:'/contact.html'}},console:{warn(){warnings++;}},document:{querySelectorAll(){return[];},querySelector(){return null;},createElement:el,body:{append(){}}},fetch(){calls++;throw Error('unexpected');}});
  for(const n of ['site-config','navigation','filters','gallery','forms','contact','effects','maps-config','maps','main'])vm.runInContext(fs.readFileSync(path.join(root,`assets/js/${n}.js`),'utf8'),context);
  assert.equal(calls,0);assert.equal(warnings,0);for(const n of ['initContact','initNavigation','initFilters','initGallery','initForms','initMaps','initEffects'])assert.equal(typeof context.window.AGANO[n],'function');
});
test('empty destination opens the official recipient chooser without inventing a number',()=>{const r=API.prepare(valid,'general',{whatsapp:''});assert.equal(Object.keys(r.errors).length,0);const u=new URL(r.url);assert.equal(u.origin,'https://wa.me');assert.equal(u.pathname,'/');assert.equal(r.mode,'chooser');assert.equal(u.searchParams.get('text'),r.message);});
test('configured international recipient is normalised and fixed outside the form',()=>{const r=API.prepare(valid,'general',{whatsapp:'+263 (77) 105-0052'});assert.equal(new URL(r.url).pathname,'/263771050052');assert.equal(r.mode,'direct');});
test('malicious or malformed destinations cannot change protocol, host or parameters',()=>{for(const n of ['javascript:alert(1)','https://evil.test','263771050052?text=bad','263771050052&phone=1','+0001234','123'])assert.throws(()=>API.link('Hello',n));});
test('valid supplier and career messages use their own categories',()=>{assert.equal(Object.keys(API.prepare({...valid,kind:'supplier',category:'Engineering'},'supplier',{}).errors).length,0);assert.equal(Object.keys(API.prepare({...valid,kind:'career',category:'Graduate & internship'},'career',{}).errors).length,0);});
test('unknown form, categories, injected recipients and omitted consent are rejected',()=>{for(const change of [{privacy:false},{category:'Administrator'},{recipient:'attacker'},{website:'spam'},{email:'person@example.test\r\nBcc:evil'},{name:'test\u0000person'},{subject:'line\nbreak'}])assert.ok(Object.keys(API.validate({...valid,...change},'general').errors).length>0);assert.ok(API.validate(valid,'unknown').errors.form);});
test('field bounds and required supplier identity are enforced',()=>{for(const change of [{name:''},{name:'x'.repeat(81)},{email:'not-an-email'},{message:'short'},{message:'x'.repeat(1001)}])assert.ok(Object.keys(API.validate({...valid,...change},'general').errors).length>0);assert.ok(API.validate({...valid,company:'',category:'Engineering'},'supplier').errors.company);});
test('Unicode and punctuation remain literal text, without query parameter injection',()=>{const r=API.prepare({...valid,name:'Ndlovu 李',message:'A literal <script>alert(1)</script> &phone=123 and #fragment in a business enquiry.'},'general',{});const u=new URL(r.url);assert.equal([...u.searchParams.keys()].length,1);assert.ok(u.searchParams.get('text').includes('<script>alert(1)</script> &phone=123'));assert.equal(u.hash,'');});
test('oversized encoded handoffs keep the complete message and provide explicit paste fallback',()=>{const r=API.prepare({...valid,message:'界'.repeat(900)},'general',{});assert.equal(r.manualPaste,true);assert.ok(r.message.endsWith('界'.repeat(900)));assert.ok(new URL(r.url).searchParams.get('text').includes('paste'));assert.ok(r.url.length<6500);});
test('forms enable normally without an email backend, requests or popups',()=>{const e=ui();assert.equal(e.selectors['[data-form-fields]'].disabled,false);assert.equal(e.selectors['[data-submit]'].disabled,false);assert.equal(e.network,0);assert.equal(e.opens,0);});
test('submit produces an exact preview and link but never sends, opens or resets',()=>{const e=ui();e.submit();assert.equal(e.selectors['[data-message-review]'].hidden,false);assert.ok(e.selectors['[data-message-preview]'].value.includes(valid.message));assert.equal(new URL(e.selectors['[data-whatsapp-continue]'].href).searchParams.get('text'),e.selectors['[data-message-preview]'].value);assert.equal(e.network,0);assert.equal(e.opens,0);assert.equal(e.resets,0);assert.match(e.selectors['[data-form-status]'].textContent,/not been sent/);});
test('editing invalidates a previously prepared link',()=>{const e=ui();e.submit();e.form.listeners.input();assert.equal(e.selectors['[data-message-review]'].hidden,true);assert.equal(e.selectors['[data-whatsapp-continue]'].getAttribute('href'),null);});
test('continuing never claims delivery or clears the original message',()=>{const e=ui();e.submit();e.selectors['[data-whatsapp-continue]'].listeners.click({preventDefault(){}});assert.match(e.selectors['[data-form-status]'].textContent,/cannot verify/);assert.equal(e.resets,0);});
test('explicit copy action copies the complete preview only on the user action',async()=>{const e=ui();e.submit();assert.equal(e.copied,'');await e.selectors['[data-copy-message]'].listeners.click();assert.equal(e.copied,e.selectors['[data-message-preview]'].value);});
test('reset removes stale message links and preview content',()=>{const e=ui();e.submit();e.form.listeners.reset();assert.equal(e.selectors['[data-whatsapp-continue]'].getAttribute('href'),null);assert.equal(e.selectors['[data-message-preview]'].value,'');});
test('clipboard fallback selects text without falsely reporting it copied',async()=>{const e=ui();e.context.navigator.clipboard=undefined;e.context.window.isSecureContext=false;e.submit();await e.selectors['[data-copy-message]'].listeners.click();assert.equal(e.selectors['[data-message-preview]'].selected,true);assert.equal(e.copied,'');assert.match(e.selectors['[data-copy-status]'].textContent,/selected/);});
test('public contact configuration addresses all three forms to the supplied AGANO number',()=>{
  const context=load();vm.runInContext(fs.readFileSync(path.join(root,'assets/js/site-config.js'),'utf8'),context);
  const config=context.window.AGANO_CONFIG, api=context.window.AGANO.whatsapp;
  assert.equal(config.email,'info@aganolegacyresources.co.zw');assert.equal(config.telephone,'+263 78 094 8702');
  assert.equal(config.officeAddress,'1, Ward 8, Sebakwe Bloke, Kwekwe, Zimbabwe');assert.equal(Object.keys(config.sites).length,4);
  for(const [kind,category] of [['general','General enquiry'],['supplier','Engineering'],['career','Graduate & internship']]){
    const result=api.prepare({...valid,kind,category},kind,config);
    assert.equal(Object.keys(result.errors).length,0);assert.equal(result.mode,'direct');
    assert.equal(new URL(result.url).pathname,'/263780948702');
  }
});

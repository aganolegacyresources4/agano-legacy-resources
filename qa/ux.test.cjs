const test = require('node:test');
const assert = require('node:assert/strict');
const { environment } = require('./dom-fixture.cjs');

const revealSelector = '[data-reveal], main .section-intro, main .section-head, main .full-media, main .portfolio-banner, main .grid-3 > .card, main .grid-4 > .card';
function effectsUI({ reduced = false, observers = true } = {}) {
  const e = environment(), header = e.element('header'), dock = e.element('div'), top = e.element('a');
  header.className = 'site-header'; header.rect = { top: 0, bottom: 92, height: 92 };
  dock.setAttribute('data-utility-dock', ''); top.setAttribute('data-utility-top', ''); top.hidden = true; dock.append(top);
  const article = e.element('article'), section = e.element('section'), footer = e.element('footer'), form = e.element('form');
  footer.className = 'site-footer'; form.setAttribute('data-enquiry-form', '');
  article.append(section); e.doc.body.append(header, article, form, dock, footer);
  e.doc.queries.set('article.reading', [article]); e.doc.queries.set(revealSelector, [section]);
  e.win.matchMedia('(prefers-reduced-motion: reduce)').matches = reduced;
  if (!observers) { e.win.IntersectionObserver = undefined; e.win.ResizeObserver = undefined; }
  e.load('effects'); e.win.AGANO.initEffects();
  return { ...e, header, dock, top, article, section, form, footer };
}
function navUI() {
  const e = environment(), header = e.element('header'), nav = e.element('nav'), toggle = e.element('button');
  header.className = 'site-header'; nav.id = 'primary-nav'; toggle.setAttribute('data-menu-toggle', '');
  const items = [0, 1].map(n => {
    const item = e.element('details'), summary = e.element('summary'), link = e.element('a');
    item.setAttribute('data-nav-dropdown', ''); link.href = n ? 'operations.html' : 'about.html';
    if (!n) link.setAttribute('aria-current', 'page');
    item.append(summary, link); nav.append(item); return { item, summary, link };
  });
  header.append(toggle, nav); e.doc.body.append(header);
  e.load('navigation'); e.win.AGANO.initNavigation();
  return { ...e, header, nav, toggle, items };
}
function galleryUI({ motion = false, nativeDialog = true, openingFails = false } = {}) {
  const e = environment(), dialog = e.element('dialog');
  dialog.setAttribute('data-lightbox-dialog', '');
  const nodes = {};
  for (const name of ['image', 'caption', 'stage', 'status', 'position', 'source', 'close', 'prev', 'next']) {
    const node = e.element(name === 'image' ? 'img' : name === 'source' ? 'a' : ['close', 'prev', 'next'].includes(name) ? 'button' : 'div');
    node.setAttribute('data-lightbox-' + name, ''); nodes[name] = node; dialog.append(node);
  }
  const triggers = [0, 1, 2].map(n => {
    const link = e.element('a'), image = e.element('img');
    image.alt = 'Description ' + n; link.href = '/image-' + n + '.webp';
    link.setAttribute('data-lightbox', ''); link.dataset.caption = 'Caption ' + n; link.append(image); e.doc.body.append(link); return link;
  });
  e.doc.body.append(dialog);
  if (!nativeDialog) dialog.showModal = undefined;
  if (openingFails) dialog.showModal = () => { throw new Error('dialog unavailable'); };
  if (motion) e.load('effects');
  e.load('gallery'); e.win.AGANO.initGallery();
  return { ...e, dialog, triggers, ...nodes };
}
const valid = { kind: 'general', name: 'Test Person', company: 'Business', email: 'person@business.test', phone: '+263 77 000 0000', category: 'General enquiry', subject: 'Partnership discussion', message: 'A non-confidential introduction to a business opportunity.', privacy: true, website: '' };
function formUI(overrides = {}, query = '') {
  const e = environment(), form = e.element('form'), fields = e.element('fieldset'), controls = {}, nodes = {};
  form.dataset.kind = 'general'; form.setAttribute('data-enquiry-form', ''); form.payload = { ...valid, ...overrides };
  fields.setAttribute('data-form-fields', ''); fields.disabled = true; form.append(fields);
  for (const key of ['name', 'company', 'email', 'phone', 'category', 'subject', 'message', 'privacy']) {
    const wrapper = e.element('div'), control = e.element(key === 'message' ? 'textarea' : 'input');
    control.id = 'general-' + key; control.name = key; control.type = key === 'privacy' ? 'checkbox' : 'text';
    control.value = String(form.payload[key]); control.checked = form.payload[key] === true;
    wrapper.append(control); fields.append(wrapper); controls[key] = control;
  }
  controls.message.setAttribute('aria-describedby', 'general-message-help general-message-count');
  for (const name of ['submit', 'form-status', 'message-review', 'message-preview', 'whatsapp-continue', 'routing-note', 'copy-status', 'copy-message', 'edit-message', 'error-summary', 'error-list', 'error-intro', 'character-count']) {
    const tag = name === 'error-list' ? 'ul' : name === 'whatsapp-continue' ? 'a' : name === 'message-preview' ? 'textarea' : name.includes('message') && !['message-review', 'routing-note'].includes(name) ? 'button' : 'div';
    const node = e.element(tag); node.setAttribute('data-' + name, ''); nodes[name] = node;
  }
  nodes['message-review'].hidden = true; nodes['error-summary'].hidden = true;
  nodes['error-summary'].append(nodes['error-intro'], nodes['error-list']);
  nodes['message-review'].append(nodes['message-preview'], nodes['whatsapp-continue'], nodes['routing-note'], nodes['copy-message'], nodes['copy-status'], nodes['edit-message']);
  fields.append(nodes.submit, nodes['character-count']);
  form.append(nodes['error-summary'], nodes['form-status'], nodes['message-review']);
  form.elements = { namedItem: key => controls[key] || null };
  e.doc.body.append(form); e.win.location.search = query;
  e.win.AGANO_CONFIG = { whatsapp: '', sites: { silobela: 'Silobela Antimony Complex', sebakwe: 'Sebakwe' } };
  e.load('forms'); e.win.AGANO.initForms();
  return { ...e, form, fields, controls, nodes, set(key, value) { form.payload[key] = value; controls[key].value = String(value); controls[key].checked = value === true; } };
}

test('reading progress clamps to the article range, including short articles', () => {
  const e = environment(); e.load('effects'); const progress = e.win.AGANO.readingProgress;
  assert.equal(progress(-100, 200, 1000), 0); assert.equal(progress(600, 200, 1000), .5);
  assert.equal(progress(2000, 200, 1000), 1); assert.equal(progress(10, 10, 10), 1);
});
test('scroll updates are coalesced without remeasuring article layout on every event', () => {
  const e = effectsUI(), reads = e.article.reads;
  e.win.scrollY = 604; for (let i = 0; i < 20; i++) e.win.fire('scroll');
  assert.equal(e.frames.size, 1); e.flush();
  assert.equal(e.article.reads, reads); assert.equal(e.header.querySelector('progress').value, .5);
  assert.equal(e.header.classList.contains('is-scrolled'), true);
});
test('effects initialise once and leave content visible without observer APIs', () => {
  const e = effectsUI({ observers: false });
  e.win.AGANO.initEffects();
  assert.equal(e.win.listeners.scroll.length, 1); assert.equal(e.header.querySelectorAll('progress').length, 1);
  assert.equal(e.section.hidden, false); assert.equal(e.dock.classList.contains('is-floating'), false);
});
test('section entrance runs once, cancels for focus and respects live reduced-motion changes', async () => {
  const e = effectsUI(), observer = e.observers.find(item => item.options.threshold === .08);
  observer.trigger([{ target: e.section, isIntersecting: true }]);
  assert.equal(e.section.animations.length, 1); assert.equal(observer.targets.has(e.section), false);
  e.section.focus(); assert.equal(e.section.animations[0].cancelled, true);
  const animation = e.win.AGANO.motion.animate(e.article, [{ opacity: .8 }, { opacity: 1 }], { duration: 480 });
  e.win.matchMedia('(prefers-reduced-motion: reduce)').setMatches(true);
  assert.equal(animation.cancelled, true);
  assert.equal(e.win.AGANO.motion.animate(e.article, [], {}), null);
  assert.equal(e.section.hidden, false); await Promise.resolve();
});
test('reduced motion never creates a reveal observer or starts movement', () => {
  const e = effectsUI({ reduced: true });
  assert.equal(e.observers.some(item => item.options.threshold === .08), false);
  assert.equal(e.win.AGANO.motion.animate(e.section, [], {}), null);
  assert.equal(e.section.hidden, false);
});
test('floating controls yield to enquiry forms and footer without hiding focused controls', () => {
  const e = effectsUI(), observer = e.observers.find(item => item.options.rootMargin);
  observer.trigger([{ target: e.form, isIntersecting: true }]); e.flush(); assert.equal(e.dock.hidden, true);
  observer.trigger([{ target: e.form, isIntersecting: false }]); e.flush(); assert.equal(e.dock.hidden, false);
  e.top.focus();
  observer.trigger([{ target: e.footer, isIntersecting: true }]); e.flush(); assert.equal(e.dock.hidden, false);
  e.doc.body.focus(); e.flush(); assert.equal(e.dock.hidden, true);
});
test('page cache restoration reconnects observers and refreshes progress without duplicate listeners', () => {
  const e = effectsUI(), size = e.sizeObservers[0];
  assert.equal(size.targets.size, 2);
  e.win.fire('scroll'); e.win.fire('pagehide');
  assert.equal(e.frames.size, 0); assert.equal(size.targets.size, 0);
  e.win.fire('pageshow', { persisted: true }); e.flush();
  assert.equal(size.targets.size, 2); assert.equal(e.win.listeners.scroll.length, 1);
});
test('navigation has stable labels, current-section context and no duplicate handlers', () => {
  const e = navUI(); e.win.AGANO.initNavigation();
  e.toggle.fire('click');
  assert.equal(e.toggle.getAttribute('aria-expanded'), 'true'); assert.equal(e.nav.classList.contains('is-open'), true);
  assert.equal(e.items[0].item.classList.contains('has-current-page'), true);
  assert.equal(e.toggle.listeners.click.length, 1); assert.equal(e.doc.listeners.keydown.length, 1);
  e.doc.fire('keydown', { key: 'Escape' });
  assert.equal(e.nav.classList.contains('is-open'), false); assert.equal(e.doc.activeElement, e.toggle);
});
test('dropdown keyboard access closes competing disclosures and Escape returns focus', () => {
  const e = navUI(); e.toggle.fire('click'); e.items[1].item.open = true;
  e.items[0].summary.fire('keydown', { key: 'ArrowDown' });
  assert.equal(e.items[0].item.open, true); assert.equal(e.items[1].item.open, false);
  assert.equal(e.doc.activeElement, e.items[0].link);
  e.doc.fire('keydown', { key: 'Escape' });
  assert.equal(e.items[0].item.open, false); assert.equal(e.doc.activeElement, e.items[0].summary);
});
test('breakpoint changes and focus leaving the header close the mobile menu coherently', () => {
  const e = navUI(); e.toggle.fire('click'); e.items[0].link.focus();
  e.win.matchMedia('(min-width:1101px)').setMatches(false);
  assert.equal(e.doc.activeElement, e.toggle); assert.equal(e.toggle.getAttribute('aria-expanded'), 'false');
  e.toggle.fire('click'); const outside = e.element('button'); e.doc.body.append(outside); outside.focus();
  assert.equal(e.nav.classList.contains('is-open'), false); assert.equal(e.doc.activeElement, outside);
});
test('gallery reports real loading and errors, cycles images and ignores stale loads', () => {
  const e = galleryUI(); const open = e.triggers[0].fire('click');
  assert.equal(open.defaultPrevented, true); assert.equal(e.dialog.open, true);
  assert.equal(e.stage.getAttribute('aria-busy'), 'true'); assert.equal(e.image.hidden, true);
  const stale = e.images[0].onload;
  e.next.fire('click'); stale(); assert.equal(e.image.hidden, true);
  e.images[1].onload();
  assert.equal(e.image.hidden, false); assert.equal(e.image.src, e.triggers[1].href);
  assert.equal(e.image.alt, 'Description 1'); assert.equal(e.position.textContent, 'Image 2 of 3');
  e.next.fire('click'); e.images[2].onerror();
  assert.equal(e.status.getAttribute('data-error'), 'true'); assert.match(e.status.textContent, /could not be loaded/);
  assert.equal(e.source.href, e.triggers[2].href);
  e.next.fire('click'); assert.equal(e.position.textContent, 'Image 1 of 3');
});
test('native gallery Escape returns focus and modifier clicks retain ordinary image navigation', () => {
  const e = galleryUI(); assert.equal(e.triggers[0].fire('click', { ctrlKey: true }).defaultPrevented, undefined);
  assert.equal(e.images.length, 0);
  e.triggers[2].fire('click'); e.dialog.fire('cancel');
  assert.equal(e.dialog.open, false); assert.equal(e.doc.activeElement, e.triggers[2]); assert.equal(e.images[0].onload, null);
  e.win.AGANO.initGallery(); assert.equal(e.triggers[0].listeners.click.length, 1);
});
test('gallery dismissal is immediate and cannot be blocked by an unfinished entrance animation', () => {
  const e = galleryUI({ motion: true }); e.triggers[0].fire('click'); e.close.fire('click');
  assert.equal(e.dialog.open, false); assert.equal(e.doc.activeElement, e.triggers[0]);
  assert.equal(e.images[0].onload, null);
  e.win.matchMedia('(prefers-reduced-motion: reduce)').matches = true;
  e.triggers[1].fire('click'); e.close.fire('click'); assert.equal(e.dialog.open, false);
});
test('without native dialog support gallery links retain ordinary image navigation', () => {
  const e = galleryUI({ nativeDialog: false });
  assert.notEqual(e.triggers[0].fire('click').defaultPrevented, true);
  assert.equal(e.dialog.open, false); assert.equal(e.images.length, 0);
});
test('a failed native modal opening falls back to the real image instead of blocking the link', () => {
  const e = galleryUI({ openingFails: true });
  e.triggers[1].fire('click');
  assert.equal(e.win.assigned, e.triggers[1].href); assert.equal(e.images.length, 0);
});
test('form errors are discoverable by summary links and retain character guidance', () => {
  const e = formUI({ name: '', email: 'invalid', message: 'short', privacy: false });
  e.form.fire('submit');
  assert.equal(e.form.noValidate, true); assert.equal(e.nodes['error-summary'].hidden, false);
  assert.equal(e.doc.activeElement, e.nodes['error-summary']);
  assert.equal(e.nodes['error-list'].children.length, 4);
  assert.match(e.controls.message.getAttribute('aria-describedby'), /general-message-help general-message-count general-message-error/);
  const link = e.nodes['error-list'].children[0].children[0];
  e.nodes['error-list'].fire('click', { target: link }); assert.equal(e.doc.activeElement, e.controls.name);
  e.set('name', 'Updated Name'); e.form.fire('input', { target: e.controls.name });
  assert.equal(e.controls.name.getAttribute('aria-invalid'), null);
});
test('validation waits for blur or submit and counters update without a live-region announcement', () => {
  const e = formUI(); e.set('email', 'invalid'); e.form.fire('input', { target: e.controls.email });
  assert.equal(e.controls.email.getAttribute('aria-invalid'), null);
  e.form.fire('focusout', { target: e.controls.email }); assert.equal(e.controls.email.getAttribute('aria-invalid'), 'true');
  e.set('message', 'x'.repeat(950)); e.form.fire('input', { target: e.controls.message });
  assert.match(e.nodes['character-count'].textContent, /^950/); assert.equal(e.nodes['character-count'].dataset.limitState, 'near');
  assert.equal(e.nodes['character-count'].getAttribute('aria-live'), null);
  e.form.fire('reset'); assert.match(e.nodes['character-count'].textContent, /^0 /);
});
test('pending clipboard feedback is honest and cannot claim a stale message was copied', async () => {
  const e = formUI(); let resolve;
  e.context.navigator.clipboard.writeText = () => new Promise(done => { resolve = done; });
  e.form.fire('submit'); const copy = e.nodes['copy-message'].listeners.click[0]();
  assert.equal(e.nodes['copy-message'].disabled, true); assert.equal(e.nodes['copy-message'].getAttribute('aria-busy'), 'true');
  e.set('subject', 'A revised subject'); e.form.fire('input', { target: e.controls.subject });
  resolve(); await copy;
  assert.equal(e.nodes['copy-status'].textContent, ''); assert.equal(e.nodes['copy-message'].disabled, false);
  assert.equal(e.nodes['whatsapp-continue'].getAttribute('href'), null);
});
test('invalid destination clears a previous handoff and form initialisation is idempotent', () => {
  const e = formUI(); e.win.AGANO.initForms(); assert.equal(e.form.listeners.submit.length, 1);
  e.form.fire('submit'); assert.ok(e.nodes['whatsapp-continue'].href);
  e.win.AGANO_CONFIG = { whatsapp: 'javascript:alert(1)' }; e.form.fire('submit');
  assert.equal(e.nodes['whatsapp-continue'].getAttribute('href'), null);
  assert.equal(e.nodes['message-review'].hidden, true); assert.match(e.nodes['form-status'].textContent, /not configured correctly/);
});
function filterUI() {
  const e = environment(), wrapper = e.element('div'), bar = e.element('div'), list = e.element('div');
  const field = e.element('select'), count = e.element('p'), reset = e.element('button'), empty = e.element('p');
  bar.setAttribute('data-filter-controls', 'news'); list.setAttribute('data-filter-list', 'news');
  field.setAttribute('data-filter', 'category'); field.value = 'all';
  count.setAttribute('data-filter-count', ''); reset.setAttribute('data-filter-reset', ''); empty.setAttribute('data-filter-empty', '');
  const items = ['Responsibility', 'Resource development', 'Business engagement'].map(category => {
    const item = e.element('article'); item.setAttribute('data-filter-item', ''); item.dataset.category = category; list.append(item); return item;
  });
  bar.append(field, count, reset); wrapper.append(bar, list, empty); e.doc.body.append(wrapper);
  e.load('filters'); e.win.AGANO.initFilters();
  return { ...e, bar, field, count, reset, empty, items };
}
test('filtering announces counts and selected state while retaining control focus', () => {
  const e = filterUI(); e.field.focus(); e.field.value = 'Responsibility'; e.field.fire('change');
  assert.equal(e.items.filter(item => !item.hidden).length, 1); assert.equal(e.count.textContent, '1 result');
  assert.equal(e.count.getAttribute('aria-live'), 'polite'); assert.equal(e.bar.classList.contains('is-active'), true);
  assert.equal(e.doc.activeElement, e.field); assert.equal(e.empty.hidden, true);
});
test('filter reset restores every article and clears the empty state without duplicate handlers', () => {
  const e = filterUI(); e.win.AGANO.initFilters(); e.field.value = 'No match'; e.field.fire('change');
  assert.equal(e.empty.hidden, false); e.reset.focus(); e.reset.fire('click');
  assert.equal(e.count.textContent, '3 results'); assert.equal(e.empty.hidden, true);
  assert.equal(e.items.every(item => !item.hidden), true); assert.equal(e.doc.activeElement, e.reset);
  assert.equal(e.field.listeners.change.length, 1);
});
test('WhatsApp shortcuts keep message review and correct asset paths on root and article pages', () => {
  for (const pathname of ['/contact.html', '/news/responsible-resource-development.html', '/sites/sebakwe.html']) {
    const e = environment(), footer = e.element('footer'); footer.className = 'site-footer'; e.doc.body.append(footer);
    e.win.location.pathname = pathname; e.win.AGANO_CONFIG = {};
    e.load('contact'); e.win.AGANO.initContact(); e.win.AGANO.initContact();
    const prefix = /^\/(?:news|sites)\//.test(pathname) ? '../' : '';
    const docks = e.doc.querySelectorAll('[data-utility-dock]'); assert.equal(docks.length, 1);
    const shortcut = docks[0].children[0]; assert.equal(shortcut.href, prefix + 'contact.html#enquiry');
    assert.equal(shortcut.children[0].src, prefix + 'assets/icons/whatsapp.svg');
    assert.equal(shortcut.getAttribute('aria-label'), 'Prepare a WhatsApp enquiry');
  }
});
test('site enquiry links prefill only known portfolio context without overwriting visitor input', () => {
  const e = formUI({ subject: '', category: '' }, '?site=silobela');
  assert.equal(e.controls.subject.value, 'Site enquiry: Silobela Antimony Complex');
  assert.equal(e.controls.category.value, 'Mining operations');
  const typed = formUI({ subject: 'My own subject', category: 'Procurement' }, '?site=silobela');
  assert.equal(typed.controls.subject.value, 'My own subject'); assert.equal(typed.controls.category.value, 'Procurement');
});
test('unknown or prototype-like site context cannot inject form text', () => {
  for (const value of ['__proto__', 'constructor', '<script>alert(1)</script>']) {
    const e = formUI({ subject: '', category: '' }, '?site=' + encodeURIComponent(value));
    assert.equal(e.controls.subject.value, ''); assert.equal(e.controls.category.value, '');
  }
});

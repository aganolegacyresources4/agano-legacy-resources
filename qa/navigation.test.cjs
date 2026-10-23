/* Observable disclosure state/focus regressions. Native keyboard/layout still need browser QA. */
const test = require('node:test');
const assert = require('node:assert/strict');
const { environment } = require('./dom-fixture.cjs');

function setup({ desktop = false, early = false, media = true, legacyMedia = false } = {}) {
  const e = environment();
  const header = e.element('header'), nav = e.element('nav'), toggle = e.element('button');
  header.className = 'site-header'; nav.id = 'primary-nav'; toggle.hidden = true;
  toggle.setAttribute('data-menu-toggle', ''); toggle.setAttribute('aria-expanded', 'false');
  const groups = [0, 1].map(n => {
    const item = e.element('details'), summary = e.element('summary'), link = e.element('a');
    item.setAttribute('data-nav-dropdown', ''); link.href = n ? 'projects.html' : 'about.html';
    item.append(summary, link); nav.append(item); return { item, summary, link };
  });
  const outside = e.element('button');
  header.append(toggle, nav); e.doc.body.append(header, outside);
  if (media) e.win.matchMedia('(min-width:1101px)').matches = desktop;
  else e.win.matchMedia = undefined;
  if (legacyMedia) {
    const query = e.win.matchMedia('(min-width:1101px)');
    const add = query.addEventListener.bind(query);
    query.addListener = callback => add('change', callback);
    query.addEventListener = undefined;
  }
  if (early) e.doc.readyState = 'interactive';
  e.load('navigation'); e.win.AGANO.initNavigation();
  return { ...e, header, nav, toggle, groups, outside };
}
test('mobile starts with a visible named trigger and semantically hidden navigation', () => {
  const e = setup();
  assert.equal(e.toggle.hidden, false); assert.equal(e.nav.hidden, true);
  assert.equal(e.toggle.getAttribute('aria-expanded'), 'false');
  assert.equal(e.toggle.getAttribute('aria-label'), 'Main menu');
  assert.equal(e.nav.getAttribute('aria-modal'), null);
});
test('twenty successive open/close cycles preserve visibility, state, label and unlocked document', () => {
  const e = setup();
  for (let i = 0; i < 20; i++) {
    e.toggle.fire('click');
    assert.equal(e.nav.hidden, false); assert.equal(e.toggle.getAttribute('aria-expanded'), 'true');
    e.groups[0].item.open = true;
    e.toggle.fire('click');
    assert.equal(e.nav.hidden, true); assert.equal(e.toggle.getAttribute('aria-expanded'), 'false');
    assert.equal(e.groups[0].item.open, false);
  }
  assert.equal(e.toggle.getAttribute('aria-label'), 'Main menu');
  assert.equal(e.doc.body.getAttribute('inert'), null); assert.equal(e.frames.size, 0);
});
test('rapid input takes effect immediately without an animation callback', () => {
  const e = setup();
  for (let i = 0; i < 41; i++) e.toggle.fire('click');
  assert.equal(e.nav.hidden, false); assert.equal(e.toggle.getAttribute('aria-expanded'), 'true');
  e.doc.fire('keydown', { key: 'Escape' });
  assert.equal(e.nav.hidden, true); assert.equal(e.doc.activeElement, e.toggle);
});
test('Escape dismisses the inner disclosure before the outer mobile navigation', () => {
  const e = setup(); e.toggle.fire('click'); e.groups[0].item.open = true; e.groups[0].link.focus();
  e.doc.fire('keydown', { key: 'Escape' });
  assert.equal(e.groups[0].item.open, false); assert.equal(e.nav.hidden, false);
  assert.equal(e.doc.activeElement, e.groups[0].summary);
  e.doc.fire('keydown', { key: 'Escape' });
  assert.equal(e.nav.hidden, true); assert.equal(e.doc.activeElement, e.toggle);
});
test('normal Tab is not intercepted or trapped by a non-modal navigation', () => {
  const e = setup(); e.toggle.fire('click');
  assert.notEqual(e.doc.fire('keydown', { key: 'Tab' }).defaultPrevented, true);
  assert.notEqual(e.doc.fire('keydown', { key: 'Tab', shiftKey: true }).defaultPrevented, true);
  e.outside.focus(); assert.equal(e.nav.hidden, true); assert.equal(e.doc.activeElement, e.outside);
});
test('a real link closes the panel without preventing navigation or moving destination focus', () => {
  const e = setup(); e.toggle.fire('click'); e.groups[0].item.open = true; e.groups[0].link.focus();
  const event = e.nav.fire('click', { target: e.groups[0].link, button: 0 });
  assert.notEqual(event.defaultPrevented, true); assert.equal(e.nav.hidden, true);
  assert.equal(e.doc.activeElement, e.groups[0].link);
});
test('modified link clicks retain ordinary browser behaviour', () => {
  const e = setup(); e.toggle.fire('click');
  const event = e.nav.fire('click', { target: e.groups[0].link, ctrlKey: true });
  assert.equal(e.nav.hidden, false); assert.notEqual(event.defaultPrevented, true);
});
test('desktop presentation has no hamburger and no hidden navigation', () => {
  const e = setup({ desktop: true });
  assert.equal(e.nav.hidden, false); assert.equal(e.toggle.hidden, true);
  e.toggle.fire('click'); assert.equal(e.nav.classList.contains('is-open'), false);
});
test('widening while the hamburger is focused moves focus to a visible navigation control', () => {
  const e = setup(); e.toggle.focus(); e.toggle.fire('click');
  e.win.matchMedia('(min-width:1101px)').setMatches(true);
  assert.equal(e.nav.hidden, false); assert.equal(e.toggle.hidden, true);
  assert.equal(e.doc.activeElement, e.groups[0].summary);
});
test('widening closes nested disclosures without leaving their hidden links focused', () => {
  const e = setup(); e.toggle.fire('click'); e.groups[1].item.open = true; e.groups[1].link.focus();
  e.win.matchMedia('(min-width:1101px)').setMatches(true);
  assert.equal(e.groups[1].item.open, false); assert.equal(e.doc.activeElement, e.groups[1].summary);
});
test('narrowing while a desktop link is focused returns focus to the visible mobile trigger', () => {
  const e = setup({ desktop: true }); e.groups[0].item.open = true; e.groups[0].link.focus();
  e.win.matchMedia('(min-width:1101px)').setMatches(false);
  assert.equal(e.nav.hidden, true); assert.equal(e.toggle.hidden, false); assert.equal(e.doc.activeElement, e.toggle);
});
test('page-cache restoration resets disclosure state without duplicating listeners', () => {
  const e = setup({ early: true }); e.toggle.fire('click'); e.groups[0].item.open = true;
  e.win.fire('pageshow', { persisted: true }); e.win.AGANO.initNavigation();
  assert.equal(e.nav.hidden, true); assert.equal(e.groups[0].item.open, false);
  assert.equal(e.toggle.listeners.click.length, 1); assert.equal(e.doc.listeners.keydown.length, 1);
});
test('without matchMedia enhancement, native navigation remains visible and the unsupported trigger stays hidden', () => {
  const e = setup({ media: false });
  assert.equal(e.nav.hidden, false); assert.equal(e.toggle.hidden, true);
  assert.equal(e.doc.documentElement.classList.contains('js'), false);
});
test('legacy media-query listeners still reset mobile state and restore visible focus on resize', () => {
  const e = setup({ legacyMedia: true });
  e.toggle.fire('click'); e.groups[0].item.open = true; e.groups[0].link.focus();
  e.win.matchMedia('(min-width:1101px)').setMatches(true);
  assert.equal(e.nav.hidden, false); assert.equal(e.toggle.hidden, true);
  assert.equal(e.groups[0].item.open, false); assert.equal(e.doc.activeElement, e.groups[0].summary);
  e.win.matchMedia('(min-width:1101px)').setMatches(false);
  assert.equal(e.nav.hidden, true); assert.equal(e.doc.activeElement, e.toggle);
});

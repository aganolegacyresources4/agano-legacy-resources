/* Controlled DOM/event fixtures for logic tests. These are not a browser emulator. */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const sourceRoot = path.resolve(__dirname, '..');
const scripts = path.join(sourceRoot, fs.existsSync(path.join(sourceRoot, 'dist', 'index.html')) ? 'dist/assets/js' : 'assets/js');
const camel = text => text.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());

class Target {
  constructor() { this.listeners = {}; }
  addEventListener(type, callback) { (this.listeners[type] ||= []).push(callback); }
  dispatchEvent(event) {
    event.target ||= this;
    event.preventDefault ||= function () { this.defaultPrevented = true; };
    for (const callback of this.listeners[event.type] || []) callback(event);
    return !event.defaultPrevented;
  }
  fire(type, detail = {}) {
    const event = { type, target: this, ...detail };
    this.dispatchEvent(event);
    return event;
  }
}
class Element extends Target {
  constructor(tag, doc) {
    super();
    this.tagName = tag.toUpperCase(); this.ownerDocument = doc; this.children = [];
    this.parentElement = null; this.attrs = {}; this.dataset = {}; this.classes = new Set();
    this.value = ''; this.hidden = false; this.disabled = false; this.checked = false;
    this.open = false; this.id = ''; this.name = ''; this.type = ''; this.isConnected = true;
    this.rect = { top: 300, bottom: 1800, height: 1500, left: 0, right: 800 };
    this.queryOverrides = new Map(); this.animations = []; this.focused = 0; this.reads = 0;
    this.classList = {
      add: (...names) => names.forEach(name => this.classes.add(name)),
      remove: (...names) => names.forEach(name => this.classes.delete(name)),
      contains: name => this.classes.has(name),
      toggle: (name, force) => {
        const next = force === undefined ? !this.classes.has(name) : force;
        if (next) this.classes.add(name); else this.classes.delete(name);
        return Boolean(next);
      }
    };
  }
  get className() { return [...this.classes].join(' '); }
  set className(value) { this.classes = new Set(value.split(/\s+/).filter(Boolean)); }
  get textContent() { return (this._text || '') + this.children.map(child => child.textContent).join(''); }
  set textContent(value) { this._text = String(value); this.children = []; }
  setAttribute(key, value) {
    this.attrs[key] = String(value);
    if (key.startsWith('data-')) this.dataset[camel(key.slice(5))] = String(value);
    if (['id', 'name', 'type', 'href', 'src', 'alt'].includes(key)) this[key] = String(value);
  }
  getAttribute(key) {
    if (['href', 'id', 'name', 'type', 'src', 'alt'].includes(key)) return this[key] || this.attrs[key] || null;
    return this.attrs[key] ?? null;
  }
  removeAttribute(key) {
    delete this.attrs[key];
    if (key === 'href') this.href = '';
    if (key.startsWith('data-')) delete this.dataset[camel(key.slice(5))];
  }
  append(...children) {
    for (const child of children) { child.parentElement = this; child.ownerDocument = this.ownerDocument; this.children.push(child); }
  }
  replaceChildren(...children) { this.children = []; this._text = ''; this.append(...children); }
  before(node) {
    const parent = this.parentElement;
    if (!parent) return;
    node.parentElement = parent;
    parent.children.splice(parent.children.indexOf(this), 0, node);
  }
  after(node) {
    const parent = this.parentElement;
    if (!parent) return;
    node.parentElement = parent;
    parent.children.splice(parent.children.indexOf(this) + 1, 0, node);
  }
  remove() {
    if (this.parentElement) this.parentElement.children = this.parentElement.children.filter(child => child !== this);
    this.parentElement = null; this.isConnected = false;
  }
  contains(node) { return node === this || this.children.some(child => child.contains(node)); }
  descendants() { return this.children.flatMap(child => [child, ...child.descendants()]); }
  matches(selector) {
    if (selector.startsWith('.')) return this.classList.contains(selector.slice(1));
    if (selector.startsWith('#')) return this.id === selector.slice(1);
    const attribute = selector.match(/^\[([^=\]]+)(?:=["']?([^"'\]]+)["']?)?\]$/);
    if (attribute) {
      const key = attribute[1], value = key.startsWith('data-') ? this.dataset[camel(key.slice(5))] : this.getAttribute(key);
      return attribute[2] === undefined ? value !== undefined && value !== null : value === attribute[2];
    }
    if (selector === 'a[href]') return this.tagName === 'A' && Boolean(this.href);
    if (selector === 'a[aria-current="page"]') return this.tagName === 'A' && this.getAttribute('aria-current') === 'page';
    return this.tagName === selector.toUpperCase();
  }
  querySelectorAll(selector) {
    if (this.queryOverrides.has(selector)) return this.queryOverrides.get(selector);
    return this.descendants().filter(element => selector.split(',').some(part => element.matches(part.trim())));
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  closest(selector) { return this.matches(selector) ? this : this.parentElement?.closest(selector) || null; }
  focus() {
    this.focused++;
    this.ownerDocument.activeElement = this;
    this.ownerDocument.fire('focusin', { target: this });
  }
  select() { this.selected = true; }
  getBoundingClientRect() { this.reads++; return this.rect; }
  showModal() { this.open = true; }
  close() { this.open = false; this.fire('close'); }
  animate(frames, options) {
    let finish, cancel;
    const finished = new Promise((resolve, reject) => { finish = resolve; cancel = reject; });
    const animation = { frames, options, finished, finish, cancelled: false, cancel() { this.cancelled = true; cancel(Error('cancelled')); } };
    this.animations.push(animation);
    return animation;
  }
}
function environment() {
  const doc = new Target();
  doc.hidden = false;
  doc.createElement = tag => new Element(tag, doc);
  doc.body = doc.createElement('body');
  doc.documentElement = doc.createElement('html');
  doc.documentElement.append(doc.body);
  doc.activeElement = doc.body;
  doc.queries = new Map();
  doc.querySelectorAll = selector => doc.queries.has(selector) ? doc.queries.get(selector) : doc.documentElement.querySelectorAll(selector);
  doc.querySelector = selector => doc.querySelectorAll(selector)[0] || null;
  const win = new Target();
  win.innerHeight = 800; win.scrollY = 0; win.isSecureContext = true;
  win.location = { pathname: '/contact.html', assign(url) { win.assigned = url; } };
  const media = new Map(), frames = new Map(), observers = [], sizeObservers = [], images = [];
  let sequence = 0;
  win.requestAnimationFrame = callback => { frames.set(++sequence, callback); return sequence; };
  win.cancelAnimationFrame = id => frames.delete(id);
  win.matchMedia = query => {
    if (!media.has(query)) {
      const item = new Target();
      item.matches = false;
      item.setMatches = matches => { item.matches = matches; item.fire('change', { matches }); };
      media.set(query, item);
    }
    return media.get(query);
  };
  win.IntersectionObserver = class {
    constructor(callback, options) { this.callback = callback; this.options = options; this.targets = new Set(); observers.push(this); }
    observe(target) { this.targets.add(target); }
    unobserve(target) { this.targets.delete(target); }
    disconnect() { this.targets.clear(); }
    trigger(entries) { this.callback(entries); }
  };
  win.ResizeObserver = class {
    constructor(callback) { this.callback = callback; this.targets = new Set(); sizeObservers.push(this); }
    observe(target) { this.targets.add(target); }
    disconnect() { this.targets.clear(); }
  };
  win.Image = class { constructor() { images.push(this); } };
  const warnings = [];
  const context = vm.createContext({
    window: win, document: doc, navigator: { clipboard: { writeText: async () => {} } }, URL, URLSearchParams,
    CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options.detail; } },
    console: { warn: text => warnings.push(text) },
    FormData: class { constructor(form) { this.form = form; } *[Symbol.iterator]() { yield* Object.entries(this.form.payload); } }
  });
  return {
    doc, win, media, frames, observers, sizeObservers, images, context, warnings,
    element: tag => doc.createElement(tag),
    load(...names) { for (const name of names) vm.runInContext(fs.readFileSync(path.join(scripts, name + '.js'), 'utf8'), context); },
    flush() { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(callback => callback()); }
  };
}
module.exports = { environment };

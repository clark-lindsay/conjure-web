
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function get_binding_group_value(group, __value, checked) {
        const value = new Set();
        for (let i = 0; i < group.length; i += 1) {
            if (group[i].checked)
                value.add(group[i].__value);
        }
        if (!checked) {
            value.delete(__value);
        }
        return Array.from(value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.26.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, basedir, module) {
    	return module = {
    	  path: basedir,
    	  exports: {},
    	  require: function (path, base) {
          return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
        }
    	}, fn(module, module.exports), module.exports;
    }

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
    }

    var sources = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.sources = void 0;
    exports.sources = {
        BR: 'Basic Rules',
        PHB: "Player's Handbook",
        MM: 'Monster Manual',
        DMG: "Dungeon Master's Guide",
        DiT: 'Dead in Thay',
        ERLW: 'Eberron: Rising from the Last War',
        EEPC: "Elemental Evil Player's Companion",
        GGtR: "Guildmaster's Guide to Ravnica",
        LR: 'Locathah Rising',
        MtoF: "Mordenkainen's Tome of Foes",
        SKT: "Storm King's Thunder",
        SCAG: "Sword Coast Adventurer's Guide",
        TP: 'Tortle Package',
        ToA: 'Tomb of Annhilation',
        ToH: 'Tomb of Horrors',
        VGtM: "Volo's Guide to Monsters",
        WGtE: "Wayfinder's Guide to Eberron",
        XGtE: "Xanathar's Guide to Everything"
    };
    });

    var creatures = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.creatures = void 0;
    // TODO: add a global parameter somewhere in a configuration file so that I can specify what source books are allowed

    var BR = sources.sources.BR, MM = sources.sources.MM, DiT = sources.sources.DiT, ERLW = sources.sources.ERLW, MtoF = sources.sources.MtoF, SKT = sources.sources.SKT, TP = sources.sources.TP, ToA = sources.sources.ToA, ToH = sources.sources.ToH, VGtM = sources.sources.VGtM, WGtE = sources.sources.WGtE;
    exports.creatures = {
        beasts: [
            {
                name: 'Frog',
                challengeRating: 0,
                terrains: ['Land', 'Water'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Sea Horse',
                challengeRating: 0,
                terrains: ['Water'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Baboon',
                challengeRating: 0,
                terrains: ['Land'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Badger',
                challengeRating: 0,
                terrains: ['Land'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Bat',
                challengeRating: 0,
                terrains: ['Land', 'Air'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Cat',
                challengeRating: 0,
                terrains: ['Land'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Crab',
                challengeRating: 0,
                terrains: ['Land', 'Water'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Deer',
                challengeRating: 0,
                terrains: ['Land'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Eagle',
                challengeRating: 0,
                terrains: ['Land', 'Air'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Giant Fire Beetle',
                challengeRating: 0,
                terrains: ['Land'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Goat',
                challengeRating: 0,
                terrains: ['Land'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Hawk',
                challengeRating: 0,
                terrains: ['Land', 'Air'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Hyena',
                challengeRating: 0,
                terrains: ['Land'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Jackal',
                challengeRating: 0,
                terrains: ['Land'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Lizard',
                challengeRating: 0,
                terrains: ['Land'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Octopus',
                challengeRating: 0,
                terrains: ['Land', 'Water'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Owl',
                challengeRating: 0,
                terrains: ['Land', 'Air'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Quipper',
                challengeRating: 0,
                terrains: ['Water'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Rat',
                challengeRating: 0,
                terrains: ['Land'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Raven',
                challengeRating: 0,
                terrains: ['Land', 'Air'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Scorpion',
                challengeRating: 0,
                terrains: ['Land'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Sheep',
                challengeRating: 0,
                terrains: ['Land'],
                type: 'Beast',
                source: SKT
            },
            {
                name: 'Spider',
                challengeRating: 0,
                terrains: ['Land'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Vulture',
                challengeRating: 0,
                terrains: ['Land', 'Air'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Weasel',
                challengeRating: 0,
                terrains: ['Land'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Blood Hawk',
                challengeRating: 0.125,
                terrains: ['Land', 'Air'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Camel',
                challengeRating: 0.125,
                terrains: ['Land'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Dolphin',
                challengeRating: 0.125,
                terrains: ['Water'],
                type: 'Beast',
                source: VGtM
            },
            {
                name: 'Flying Snake',
                challengeRating: 0.125,
                terrains: ['Land', 'Air', 'Water'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Giant Crab',
                challengeRating: 0.125,
                terrains: ['Land', 'Water'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Giant Rat',
                challengeRating: 0.125,
                terrains: ['Land'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Giant Weasel',
                challengeRating: 0.125,
                terrains: ['Land'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Mastiff',
                challengeRating: 0.125,
                terrains: ['Land'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Mule',
                challengeRating: 0.125,
                terrains: ['Land'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Poisonous Snake',
                challengeRating: 0.125,
                terrains: ['Land', 'Water'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Pony',
                challengeRating: 0.125,
                terrains: ['Land'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Stirge',
                challengeRating: 0.125,
                terrains: ['Land', 'Air'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Axe Beak',
                challengeRating: 0.25,
                terrains: ['Land'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Boar',
                challengeRating: 0.25,
                terrains: ['Land'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Constrictor Snake',
                challengeRating: 0.25,
                terrains: ['Land', 'Water'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Cow',
                challengeRating: 0.25,
                terrains: ['Land'],
                type: 'Beast',
                source: VGtM
            },
            {
                name: 'Draft Horse',
                challengeRating: 0.25,
                terrains: ['Land'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Elk',
                challengeRating: 0.25,
                terrains: ['Land'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Fastieth',
                challengeRating: 0.25,
                terrains: ['Land'],
                type: 'Beast',
                source: ERLW
            },
            {
                name: 'Giant Badger',
                challengeRating: 0.25,
                terrains: ['Land'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Giant Bat',
                challengeRating: 0.25,
                terrains: ['Land', 'Air'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Giant Centipede',
                challengeRating: 0.25,
                terrains: ['Land'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Giant Frog',
                challengeRating: 0.25,
                terrains: ['Land', 'Water'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Giant Lizard',
                challengeRating: 0.25,
                terrains: ['Land'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Giant Owl',
                challengeRating: 0.25,
                terrains: ['Land', 'Air'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Giant Poisonous Snake',
                challengeRating: 0.25,
                terrains: ['Land', 'Water'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Giant Wolf Spider',
                challengeRating: 0.25,
                terrains: ['Land'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Hadrosaurus',
                challengeRating: 0.25,
                terrains: ['Land'],
                type: 'Beast',
                source: VGtM
            },
            {
                name: 'Ox',
                challengeRating: 0.25,
                terrains: ['Land'],
                type: 'Beast',
                source: VGtM
            },
            {
                name: 'Panther',
                challengeRating: 0.25,
                terrains: ['Land'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Pteranodon',
                challengeRating: 0.25,
                terrains: ['Land', 'Air'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Riding Horse',
                challengeRating: 0.25,
                terrains: ['Land'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Stench Kow',
                challengeRating: 0.25,
                terrains: ['Land'],
                type: 'Beast',
                source: VGtM
            },
            {
                name: 'Swarm of Bats',
                challengeRating: 0.25,
                terrains: ['Land'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Swarm of Rats',
                challengeRating: 0.25,
                terrains: ['Air'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Swarm of Ravens',
                challengeRating: 0.25,
                terrains: ['Land', 'Air'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Wolf',
                challengeRating: 0.25,
                terrains: ['Land'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Ape',
                challengeRating: 0.5,
                terrains: ['Land'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Black Bear',
                challengeRating: 0.5,
                terrains: ['Land'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Clawfoot Raptor',
                challengeRating: 0.5,
                terrains: ['Land'],
                type: 'Beast',
                source: WGtE
            },
            {
                name: 'Crocodile',
                challengeRating: 0.5,
                terrains: ['Land', 'Water'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Giant Goat',
                challengeRating: 0.5,
                terrains: ['Land'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Giant Sea Horse',
                challengeRating: 0.5,
                terrains: ['Water'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Giant Wasp',
                challengeRating: 0.5,
                terrains: ['Land', 'Air'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Reef Shark',
                challengeRating: 0.5,
                terrains: ['Water'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Swarm of Insects',
                challengeRating: 0.5,
                terrains: ['Land', 'Air'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Swarm of Rot Grubs',
                challengeRating: 0.5,
                terrains: ['Land'],
                type: 'Beast',
                source: VGtM
            },
            {
                name: 'Warhorse',
                challengeRating: 0.5,
                terrains: ['Land'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Brown Bear',
                challengeRating: 1.0,
                terrains: ['Land'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Clawfoot',
                challengeRating: 1.0,
                terrains: ['Land'],
                type: 'Beast',
                source: ERLW
            },
            {
                name: 'Dire Wolf',
                challengeRating: 1.0,
                terrains: ['Land'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Giant Eagle',
                challengeRating: 1.0,
                terrains: ['Land', 'Air'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Giant Hyena',
                challengeRating: 1.0,
                terrains: ['Land'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Giant Octopus',
                challengeRating: 1.0,
                terrains: ['Land'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Giant Spider',
                challengeRating: 1.0,
                terrains: ['Land'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Giant Toad',
                challengeRating: 1.0,
                terrains: ['Land', 'Water'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Giant Vulture',
                challengeRating: 1.0,
                terrains: ['Land', 'Air'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Ice Spider',
                challengeRating: 1.0,
                terrains: ['Land'],
                type: 'Beast',
                source: SKT
            },
            {
                name: 'Lion',
                challengeRating: 1.0,
                terrains: ['Land'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Swarm of Quippers',
                challengeRating: 1.0,
                terrains: ['Water'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Tiger',
                challengeRating: 1.0,
                terrains: ['Land'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Allosaurus',
                challengeRating: 2.0,
                terrains: ['Land'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Aurochs',
                challengeRating: 2.0,
                terrains: ['Land'],
                type: 'Beast',
                source: VGtM
            },
            {
                name: 'Cave Bear',
                challengeRating: 2.0,
                terrains: ['Land', 'Water'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Giant Boar',
                challengeRating: 2.0,
                terrains: ['Land'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Ice Spider Queen',
                challengeRating: 2.0,
                terrains: ['Land'],
                type: 'Beast',
                source: SKT
            },
            {
                name: 'Giant White Moray Eel',
                challengeRating: 2.0,
                terrains: ['Water'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Giant Constrictor Snake',
                challengeRating: 2.0,
                terrains: ['Land', 'Water'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Giant Elk',
                challengeRating: 2.0,
                terrains: ['Land'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Hunter Shark',
                challengeRating: 2.0,
                terrains: ['Water'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Plesiosaurus',
                challengeRating: 2.0,
                terrains: ['Land', 'Water'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Polar Bear',
                challengeRating: 2.0,
                terrains: ['Land', 'Water'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Rhinoceros',
                challengeRating: 2.0,
                terrains: ['Land'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Saber-toothed Tiger',
                challengeRating: 2.0,
                terrains: ['Land'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Swarm of Poisonous Snakes',
                challengeRating: 2.0,
                terrains: ['Land', 'Water'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Ankylosaurus',
                challengeRating: 3.0,
                terrains: ['Land'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Giant Scorpion',
                challengeRating: 3.0,
                terrains: ['Land'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Giant Snapping Turtle',
                challengeRating: 3.0,
                terrains: ['Land', 'Water'],
                type: 'Beast',
                source: ToA
            },
            {
                name: 'Killer Whale',
                challengeRating: 3.0,
                terrains: ['Water'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Elephant',
                challengeRating: 3.0,
                terrains: ['Land'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Stegosaurus',
                challengeRating: 4.0,
                terrains: ['Land'],
                type: 'Beast',
                source: VGtM
            },
            {
                name: 'Brontosaurus',
                challengeRating: 5.0,
                terrains: ['Land'],
                type: 'Beast',
                source: VGtM
            },
            {
                name: 'Giant Crocodile',
                challengeRating: 5.0,
                terrains: ['Land', 'Water'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Giant Shark',
                challengeRating: 5.0,
                terrains: ['Water'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Hulking Crab',
                challengeRating: 5.0,
                terrains: ['Land', 'Water'],
                type: 'Beast',
                source: SKT
            },
            {
                name: 'Swarm of Cranium Rats',
                challengeRating: 5.0,
                terrains: ['Land'],
                type: 'Beast',
                source: VGtM
            },
            {
                name: 'Triceratops',
                challengeRating: 5.0,
                terrains: ['Land'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Mammoth',
                challengeRating: 6.0,
                terrains: ['Land'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Giant Ape',
                challengeRating: 7.0,
                terrains: ['Land'],
                type: 'Beast',
                source: BR
            },
            {
                name: 'Tyrannosaurus Rex',
                challengeRating: 8.0,
                terrains: ['Land'],
                type: 'Beast',
                source: BR
            }
        ],
        fey: [
            {
                name: 'Boggle',
                challengeRating: 0.125,
                terrains: ['Land'],
                type: 'Fey',
                source: VGtM
            },
            {
                name: 'Valenar Hawk',
                challengeRating: 0.125,
                terrains: ['Land', 'Air'],
                type: 'Fey',
                source: ERLW
            },
            {
                name: 'Blink Dog',
                challengeRating: 0.25,
                terrains: ['Land'],
                type: 'Fey',
                source: BR
            },
            {
                name: 'Pixie',
                challengeRating: 0.25,
                terrains: ['Land', 'Air'],
                type: 'Fey',
                source: MM
            },
            {
                name: 'Sprite',
                challengeRating: 0.25,
                terrains: ['Land', 'Air'],
                type: 'Fey',
                source: BR
            },
            {
                name: 'Darkling',
                challengeRating: 0.5,
                terrains: ['Land'],
                type: 'Fey',
                source: VGtM
            },
            {
                name: 'Satyr',
                challengeRating: 0.5,
                terrains: ['Land'],
                type: 'Fey',
                source: BR
            },
            {
                name: 'Valenar Hound',
                challengeRating: 0.5,
                terrains: ['Land'],
                type: 'Fey',
                source: ERLW
            },
            {
                name: 'Valenar Steed',
                challengeRating: 0.5,
                terrains: ['Land'],
                type: 'Fey',
                source: ERLW
            },
            {
                name: 'Dryad',
                challengeRating: 1,
                terrains: ['Land'],
                type: 'Fey',
                source: BR
            },
            {
                name: 'Quickling',
                challengeRating: 1,
                terrains: ['Land'],
                type: 'Fey',
                source: VGtM
            },
            {
                name: 'Darkling Elder',
                challengeRating: 2,
                terrains: ['Land'],
                type: 'Fey',
                source: VGtM
            },
            {
                name: 'Meanlock',
                challengeRating: 2,
                terrains: ['Land'],
                type: 'Fey',
                source: VGtM
            },
            {
                name: 'Sea Hag',
                challengeRating: 2,
                terrains: ['Land', 'Water'],
                type: 'Fey',
                source: BR
            },
            {
                name: 'Green Hag',
                challengeRating: 3,
                terrains: ['Land'],
                type: 'Fey',
                source: BR
            },
            {
                name: 'Redcap',
                challengeRating: 3,
                terrains: ['Land'],
                type: 'Fey',
                source: VGtM
            },
            {
                name: 'Siren',
                challengeRating: 3,
                terrains: ['Land', 'Water'],
                type: 'Fey',
                source: ToH
            },
            {
                name: 'Yeth Hound',
                challengeRating: 4,
                terrains: ['Land', 'Air'],
                type: 'Fey',
                source: VGtM
            },
            {
                name: 'Annis Hag',
                challengeRating: 6,
                terrains: ['Land'],
                type: 'Fey',
                source: VGtM
            },
            {
                name: 'Dusk Hag',
                challengeRating: 6,
                terrains: ['Land'],
                type: 'Fey',
                source: ERLW
            },
            {
                name: 'Bheur Hag',
                challengeRating: 7,
                terrains: ['Land'],
                type: 'Fey',
                source: VGtM
            },
            {
                name: 'Korred',
                challengeRating: 7,
                terrains: ['Land'],
                type: 'Fey',
                source: VGtM
            },
            {
                name: 'Autumn Eladrin',
                challengeRating: 10,
                terrains: ['Land'],
                type: 'Fey',
                source: MtoF
            },
            {
                name: 'Spring Eladrin',
                challengeRating: 10,
                terrains: ['Land'],
                type: 'Fey',
                source: MtoF
            },
            {
                name: 'Summer Eladrin',
                challengeRating: 10,
                terrains: ['Land'],
                type: 'Fey',
                source: MtoF
            },
            {
                name: 'Winter Eladrin',
                challengeRating: 10,
                terrains: ['Land'],
                type: 'Fey',
                source: MtoF
            }
        ],
        elementals: [
            {
                name: 'Chwinga',
                challengeRating: 0,
                terrains: ['Land', 'Air', 'Water'],
                type: 'Elemental',
                source: ToA
            },
            {
                name: 'Geonid',
                challengeRating: 0.25,
                terrains: ['Land'],
                type: 'Elemental',
                source: TP
            },
            {
                name: 'Mud Mephit',
                challengeRating: 0.25,
                terrains: ['Land', 'Water', 'Air'],
                type: 'Elemental',
                source: MM
            },
            {
                name: 'Smoke Mephit',
                challengeRating: 0.25,
                terrains: ['Land', 'Air'],
                type: 'Elemental',
                source: MM
            },
            {
                name: 'Steam Mephit',
                challengeRating: 0.25,
                terrains: ['Land', 'Air'],
                type: 'Elemental',
                source: BR
            },
            {
                name: 'Dust Mephit',
                challengeRating: 0.5,
                terrains: ['Land', 'Air'],
                type: 'Elemental',
                source: BR
            },
            {
                name: 'Ice Mephit',
                challengeRating: 0.5,
                terrains: ['Land', 'Air'],
                type: 'Elemental',
                source: BR
            },
            {
                name: 'Magma Mephit',
                challengeRating: 0.5,
                terrains: ['Land', 'Air'],
                type: 'Elemental',
                source: BR
            },
            {
                name: 'Magmin',
                challengeRating: 0.5,
                terrains: ['Land'],
                type: 'Elemental',
                source: BR
            },
            {
                name: 'Fire Snake',
                challengeRating: 1,
                terrains: ['Land'],
                type: 'Elemental',
                source: MM
            },
            {
                name: 'Azer',
                challengeRating: 2,
                terrains: ['Land'],
                type: 'Elemental',
                source: BR
            },
            {
                name: 'Four-Armed Gargoyle',
                challengeRating: 2,
                terrains: ['Land', 'Air'],
                type: 'Elemental',
                source: DiT
            },
            {
                name: 'Gargoyle',
                challengeRating: 2,
                terrains: ['Land', 'Air'],
                type: 'Elemental',
                source: BR
            },
            {
                name: 'Flail Snail',
                challengeRating: 3,
                terrains: ['Land'],
                type: 'Elemental',
                source: VGtM
            },
            {
                name: 'Water Weird',
                challengeRating: 3,
                terrains: ['Water'],
                type: 'Elemental',
                source: MM
            },
            {
                name: 'Air Elemental',
                challengeRating: 5,
                terrains: ['Air'],
                type: 'Elemental',
                source: BR
            },
            {
                name: 'Earth Elemental',
                challengeRating: 5,
                terrains: ['Land'],
                type: 'Elemental',
                source: BR
            },
            {
                name: 'Fire Elemental',
                challengeRating: 5,
                terrains: ['Land'],
                type: 'Elemental',
                source: BR
            },
            {
                name: 'Water Elemental',
                challengeRating: 5,
                terrains: ['Land', 'Water'],
                type: 'Elemental',
                source: BR
            },
            {
                name: 'Salamander',
                challengeRating: 5,
                terrains: ['Land'],
                type: 'Elemental',
                source: BR
            },
            {
                name: 'Xorn',
                challengeRating: 5,
                terrains: ['Land'],
                type: 'Elemental',
                source: BR
            },
            {
                name: 'Galeb Duhr',
                challengeRating: 6,
                terrains: ['Land'],
                type: 'Elemental',
                source: MM
            },
            {
                name: 'Invisible Stalker',
                challengeRating: 6,
                terrains: ['Air', 'Land'],
                type: 'Elemental',
                source: BR
            },
            {
                name: 'Frost Salamander',
                challengeRating: 9,
                terrains: ['Land'],
                type: 'Elemental',
                source: MtoF
            },
            {
                name: 'Giant Four-Armed Gargoyle',
                challengeRating: 10,
                terrains: ['Air', 'Land'],
                type: 'Elemental',
                source: ToA
            },
            {
                name: 'Dao',
                challengeRating: 11,
                terrains: ['Air', 'Land'],
                type: 'Elemental',
                source: MM
            },
            {
                name: 'Djinni',
                challengeRating: 11,
                terrains: ['Air', 'Land'],
                type: 'Elemental',
                source: BR
            },
            {
                name: 'Efreeti',
                challengeRating: 11,
                terrains: ['Air', 'Land'],
                type: 'Elemental',
                source: BR
            },
            {
                name: 'Marid',
                challengeRating: 11,
                terrains: ['Air', 'Land', 'Water'],
                type: 'Elemental',
                source: MM
            },
            {
                name: 'Phoenix',
                challengeRating: 16,
                terrains: ['Air', 'Land'],
                type: 'Elemental',
                source: MtoF
            },
            {
                name: 'Leviathan',
                challengeRating: 20,
                terrains: ['Land', 'Water'],
                type: 'Elemental',
                source: MtoF
            },
            {
                name: 'Zaratan',
                challengeRating: 22,
                terrains: ['Land', 'Water'],
                type: 'Elemental',
                source: MtoF
            },
            {
                name: 'Elder Tempest',
                challengeRating: 23,
                terrains: ['Air'],
                type: 'Elemental',
                source: MtoF
            }
        ]
    };
    });

    var util = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.range = exports.randomInt = void 0;
    function randomInt(min, max) {
        var roundUpMin = Math.ceil(min);
        var roundDownMax = Math.floor(max);
        return Math.floor(Math.random() * (roundDownMax - roundUpMin)) + roundUpMin;
    }
    exports.randomInt = randomInt;
    function range(start, end) {
        if (end < start || start < 0 || end < 0) {
            throw Error('The start and end values of a range must be positive, with end >= start');
        }
        return Array.from(new Array(end - start), function (_, i) { return i + start; });
    }
    exports.range = range;
    });

    var randomCreatures_1 = createCommonjsModule(function (module, exports) {
    var __spreadArrays = (commonjsGlobal && commonjsGlobal.__spreadArrays) || function () {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.randomCreatures = void 0;


    function randomCreatures(_a) {
        var challengeRatingMin = _a.challengeRatingMin, challengeRatingMax = _a.challengeRatingMax, types = _a.types, count = _a.count, terrains = _a.terrains, sources = _a.sources;
        var creatures$1 = Object.values(creatures.creatures).reduce(function (accumulator, subList) { return __spreadArrays(accumulator, subList); }, []);
        creatures$1 = filterBySource(sources, creatures$1);
        creatures$1 = filterByChallengeRating(challengeRatingMin, challengeRatingMax, creatures$1);
        creatures$1 = filterByType(types, creatures$1);
        creatures$1 = filterByTerrain(terrains, creatures$1);
        if (!creatures$1.length) {
            return [];
        }
        if (count === null || count === undefined) {
            return [creatures$1[util.randomInt(0, creatures$1.length)]];
        }
        var result = [];
        for (var _i = 0, _b = util.range(0, count); _i < _b.length; _i++) {
            var _ = _b[_i];
            result.push(creatures$1[util.randomInt(0, creatures$1.length)]);
        }
        return result;
    }
    exports.randomCreatures = randomCreatures;
    function filterBySource(sources, creatures) {
        var result = creatures;
        if (sources) {
            result = result.filter(function (creature) { return sources === null || sources === void 0 ? void 0 : sources.includes(creature.source); });
        }
        return result;
    }
    function filterByChallengeRating(challengeRatingMin, challengeRatingMax, creatures) {
        var result = creatures;
        if (!isNullOrUndefined(challengeRatingMin)) {
            if (challengeRatingMin === undefined) {
                throw new Error("challengeRatingMin is undefined");
            }
            result = result.filter(function (creature) { return creature.challengeRating >= challengeRatingMin; });
        }
        if (!isNullOrUndefined(challengeRatingMax)) {
            if (challengeRatingMax === undefined) {
                throw new Error("challengeRatingMax is undefined");
            }
            result = result.filter(function (creature) { return creature.challengeRating <= challengeRatingMax; });
        }
        return result;
    }
    function filterByType(types, creatures) {
        var result = creatures;
        if (types) {
            result = result.filter(function (creature) { return types.includes(creature.type); });
        }
        return result;
    }
    function filterByTerrain(terrains, creatures) {
        if (!terrains) {
            return creatures;
        }
        var result = [];
        var _loop_1 = function (terrain) {
            result = __spreadArrays(result, creatures.filter(function (creature) { return creature.terrains.includes(terrain); }));
        };
        for (var _i = 0, terrains_1 = terrains; _i < terrains_1.length; _i++) {
            var terrain = terrains_1[_i];
            _loop_1(terrain);
        }
        return result;
    }
    function isNullOrUndefined(value) {
        return value === null || value === undefined;
    }
    });

    var conjurationSpells = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.conjureMinorElementals = exports.conjureWoodlandBeings = exports.conjureAnimals = void 0;

    function conjureAnimals(_a) {
        var challengeRating = _a.challengeRating, terrains = _a.terrains, sources = _a.sources;
        if (challengeRating > 2 || challengeRating < 0) {
            throw new Error('The challengeRating passed to conjureAnimals must be in the range [0, 2]');
        }
        var count = 1;
        if (challengeRating <= 0.25) {
            count = 8;
        }
        else if (challengeRating <= 0.5) {
            count = 4;
        }
        else if (challengeRating <= 1) {
            count = 2;
        }
        else {
            count = 1;
        }
        return randomCreatures_1.randomCreatures({
            challengeRatingMin: challengeRating,
            challengeRatingMax: challengeRating,
            terrains: terrains,
            types: ['Beast'],
            count: count,
            sources: sources
        });
    }
    exports.conjureAnimals = conjureAnimals;
    function conjureWoodlandBeings(_a) {
        var challengeRating = _a.challengeRating, terrains = _a.terrains, sources = _a.sources;
        if (challengeRating > 2 || challengeRating < 0) {
            throw new Error('The challengeRating passed to conjureWoodlandBeings must be in the range [0, 2]');
        }
        var count = 1;
        if (challengeRating <= 0.25) {
            count = 8;
        }
        else if (challengeRating <= 0.5) {
            count = 4;
        }
        else if (challengeRating <= 1) {
            count = 2;
        }
        else {
            count = 1;
        }
        return randomCreatures_1.randomCreatures({
            challengeRatingMin: challengeRating,
            challengeRatingMax: challengeRating,
            terrains: terrains,
            types: ['Fey'],
            count: count,
            sources: sources
        });
    }
    exports.conjureWoodlandBeings = conjureWoodlandBeings;
    function conjureMinorElementals(_a) {
        var challengeRating = _a.challengeRating, terrains = _a.terrains, sources = _a.sources;
        if (challengeRating > 2 || challengeRating < 0) {
            throw new Error('The challengeRating passed to conjureMinorElementals must be in the range [0, 2]');
        }
        var count = 1;
        if (challengeRating <= 0.25) {
            count = 8;
        }
        else if (challengeRating <= 0.5) {
            count = 4;
        }
        else if (challengeRating <= 1) {
            count = 2;
        }
        else {
            count = 1;
        }
        return randomCreatures_1.randomCreatures({
            challengeRatingMin: challengeRating,
            challengeRatingMax: challengeRating,
            terrains: terrains,
            types: ['Elemental'],
            count: count,
            sources: sources
        });
    }
    exports.conjureMinorElementals = conjureMinorElementals;
    });

    var src = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.sources = exports.conjureMinorElementals = exports.conjureWoodlandBeings = exports.conjureAnimals = void 0;

    Object.defineProperty(exports, "conjureAnimals", { enumerable: true, get: function () { return conjurationSpells.conjureAnimals; } });
    Object.defineProperty(exports, "conjureWoodlandBeings", { enumerable: true, get: function () { return conjurationSpells.conjureWoodlandBeings; } });
    Object.defineProperty(exports, "conjureMinorElementals", { enumerable: true, get: function () { return conjurationSpells.conjureMinorElementals; } });

    Object.defineProperty(exports, "sources", { enumerable: true, get: function () { return sources.sources; } });
    });

    const writeSourcebooks = writable([
      src.sources.BR,
      src.sources.MM,
      src.sources.PHB,
      src.sources.DMG,
    ]);

    const readSourcebooks = derived(
      writeSourcebooks,
      ($writeSourcebooks) => $writeSourcebooks
    );

    const defaultStore = {
      spellName: "Conjure Animals",
      challengeRating: 1,
      terrains: ["Land"],
    };

    function createWriteSpellParameters() {
      const { subscribe, set, update } = writable(defaultStore);

      return {
        subscribe,
        setSpellName: (spell) =>
          update((params) => {
            return { ...params, spellName: spell };
          }),
        setChallengeRating: (cr) =>
          update((params) => {
            return { ...params, challengeRating: cr };
          }),
        setTerrains: (terrains) =>
          update((params) => {
            return { ...params, terrains };
          }),
        reset: () => set(defaultStore),
      };
    }

    const writeSpellParameters = createWriteSpellParameters();

    const readSpellParameters = derived(
      writeSpellParameters,
      ($writeSpellParameters) => $writeSpellParameters
    );

    var name="svelte-app";var version="0.1.2";var scripts={build:"rollup -c",dev:"rollup -c -w",start:"sirv public",validate:"svelte-check"};var devDependencies={"@babel/core":"^7.11.6","@babel/preset-env":"^7.11.5","@rollup/plugin-commonjs":"^14.0.0","@rollup/plugin-json":"^4.1.0","@rollup/plugin-node-resolve":"^8.0.0","@rollup/plugin-typescript":"^6.0.0","@testing-library/jest-dom":"^5.11.4","@testing-library/svelte":"^3.0.0","@tsconfig/svelte":"^1.0.0","@types/jest":"^26.0.14","babel-jest":"^26.3.0",eslint:"^7.9.0","eslint-plugin-jest-dom":"^3.2.3",jest:"^26.4.2","jest-vim-reporter":"^0.0.1",prettier:"^2.1.2",rollup:"^2.3.4","rollup-plugin-livereload":"^2.0.0","rollup-plugin-svelte":"^6.0.0","rollup-plugin-terser":"^7.0.0",svelte:"^3.0.0","svelte-check":"^1.0.0","svelte-htm":"^1.1.1","svelte-jester":"^1.1.5","svelte-preprocess":"^4.3.0","ts-jest":"^26.4.0",tslib:"^2.0.0",typescript:"^3.9.3"};var dependencies={conjure5e:"^1.4.0","sirv-cli":"^1.0.0"};var packageJson = {name:name,version:version,scripts:scripts,devDependencies:devDependencies,dependencies:dependencies};

    function packageVersion() {
      if (packageJson) {
        return packageJson.version;
      } else return "";
    }

    /* src/components/HamburgerButton.svelte generated by Svelte v3.26.0 */

    const file = "src/components/HamburgerButton.svelte";

    function create_fragment(ctx) {
    	let button;
    	let svg;
    	let line0;
    	let line1;
    	let line1_x__value;
    	let line1_x__value_1;
    	let line2;
    	let button_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			svg = svg_element("svg");
    			line0 = svg_element("line");
    			line1 = svg_element("line");
    			line2 = svg_element("line");
    			attr_dev(line0, "id", "top");
    			attr_dev(line0, "x1", "0");
    			attr_dev(line0, "y1", "2");
    			attr_dev(line0, "x2", "32");
    			attr_dev(line0, "y2", "2");
    			attr_dev(line0, "class", "svelte-1gn2oj1");
    			add_location(line0, file, 44, 4, 851);
    			attr_dev(line1, "id", "middle");
    			attr_dev(line1, "x1", line1_x__value = /*left*/ ctx[1] ? "0" : "8");
    			attr_dev(line1, "y1", "12");
    			attr_dev(line1, "x2", line1_x__value_1 = /*left*/ ctx[1] ? "24" : "32");
    			attr_dev(line1, "y2", "12");
    			attr_dev(line1, "class", "svelte-1gn2oj1");
    			add_location(line1, file, 45, 4, 902);
    			attr_dev(line2, "id", "bottom");
    			attr_dev(line2, "x1", "0");
    			attr_dev(line2, "y1", "22");
    			attr_dev(line2, "x2", "32");
    			attr_dev(line2, "y2", "22");
    			attr_dev(line2, "class", "svelte-1gn2oj1");
    			add_location(line2, file, 51, 4, 1019);
    			attr_dev(svg, "width", "32");
    			attr_dev(svg, "height", "24");
    			attr_dev(svg, "class", "svelte-1gn2oj1");
    			add_location(svg, file, 43, 2, 818);
    			attr_dev(button, "class", button_class_value = "" + (/*fontColor*/ ctx[2] + " hover:" + /*hoverFontColor*/ ctx[3] + " cursor-pointer my-4 border-none focus:outline-none" + " svelte-1gn2oj1"));
    			toggle_class(button, "open", /*open*/ ctx[0]);
    			add_location(button, file, 39, 0, 664);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, svg);
    			append_dev(svg, line0);
    			append_dev(svg, line1);
    			append_dev(svg, line2);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*left*/ 2 && line1_x__value !== (line1_x__value = /*left*/ ctx[1] ? "0" : "8")) {
    				attr_dev(line1, "x1", line1_x__value);
    			}

    			if (dirty & /*left*/ 2 && line1_x__value_1 !== (line1_x__value_1 = /*left*/ ctx[1] ? "24" : "32")) {
    				attr_dev(line1, "x2", line1_x__value_1);
    			}

    			if (dirty & /*fontColor, hoverFontColor*/ 12 && button_class_value !== (button_class_value = "" + (/*fontColor*/ ctx[2] + " hover:" + /*hoverFontColor*/ ctx[3] + " cursor-pointer my-4 border-none focus:outline-none" + " svelte-1gn2oj1"))) {
    				attr_dev(button, "class", button_class_value);
    			}

    			if (dirty & /*fontColor, hoverFontColor, open*/ 13) {
    				toggle_class(button, "open", /*open*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("HamburgerButton", slots, []);
    	let { open = false } = $$props;
    	let { left = true } = $$props;
    	const writable_props = ["open", "left"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<HamburgerButton> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(0, open = !open);

    	$$self.$$set = $$props => {
    		if ("open" in $$props) $$invalidate(0, open = $$props.open);
    		if ("left" in $$props) $$invalidate(1, left = $$props.left);
    	};

    	$$self.$capture_state = () => ({ open, left, fontColor, hoverFontColor });

    	$$self.$inject_state = $$props => {
    		if ("open" in $$props) $$invalidate(0, open = $$props.open);
    		if ("left" in $$props) $$invalidate(1, left = $$props.left);
    		if ("fontColor" in $$props) $$invalidate(2, fontColor = $$props.fontColor);
    		if ("hoverFontColor" in $$props) $$invalidate(3, hoverFontColor = $$props.hoverFontColor);
    	};

    	let fontColor;
    	let hoverFontColor;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*open*/ 1) {
    			 $$invalidate(2, fontColor = open ? "text-red-500" : "text-gray-500");
    		}

    		if ($$self.$$.dirty & /*open*/ 1) {
    			 $$invalidate(3, hoverFontColor = open ? "text-red-700" : "text-gray-700");
    		}
    	};

    	return [open, left, fontColor, hoverFontColor, click_handler];
    }

    class HamburgerButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { open: 0, left: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "HamburgerButton",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get open() {
    		throw new Error("<HamburgerButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set open(value) {
    		throw new Error("<HamburgerButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get left() {
    		throw new Error("<HamburgerButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set left(value) {
    		throw new Error("<HamburgerButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Navbar.svelte generated by Svelte v3.26.0 */
    const file$1 = "src/components/Navbar.svelte";

    function create_fragment$1(ctx) {
    	let header;
    	let nav;
    	let div0;
    	let hamburgerbutton0;
    	let updating_open;
    	let div0_class_value;
    	let t0;
    	let h1;
    	let t1;
    	let t2;
    	let div1;
    	let hamburgerbutton1;
    	let updating_open_1;
    	let div1_class_value;
    	let current;

    	function hamburgerbutton0_open_binding(value) {
    		/*hamburgerbutton0_open_binding*/ ctx[3].call(null, value);
    	}

    	let hamburgerbutton0_props = {};

    	if (/*spellOptionsMenu*/ ctx[0] !== void 0) {
    		hamburgerbutton0_props.open = /*spellOptionsMenu*/ ctx[0];
    	}

    	hamburgerbutton0 = new HamburgerButton({
    			props: hamburgerbutton0_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(hamburgerbutton0, "open", hamburgerbutton0_open_binding));

    	function hamburgerbutton1_open_binding(value) {
    		/*hamburgerbutton1_open_binding*/ ctx[4].call(null, value);
    	}

    	let hamburgerbutton1_props = { left: false };

    	if (/*sourceOptionsMenu*/ ctx[1] !== void 0) {
    		hamburgerbutton1_props.open = /*sourceOptionsMenu*/ ctx[1];
    	}

    	hamburgerbutton1 = new HamburgerButton({
    			props: hamburgerbutton1_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(hamburgerbutton1, "open", hamburgerbutton1_open_binding));

    	const block = {
    		c: function create() {
    			header = element("header");
    			nav = element("nav");
    			div0 = element("div");
    			create_component(hamburgerbutton0.$$.fragment);
    			t0 = space();
    			h1 = element("h1");
    			t1 = text(/*heading*/ ctx[2]);
    			t2 = space();
    			div1 = element("div");
    			create_component(hamburgerbutton1.$$.fragment);
    			attr_dev(div0, "class", div0_class_value = /*sourceOptionsMenu*/ ctx[1] ? "invisible" : "");
    			attr_dev(div0, "data-testid", "spellOptionsMenuDiv");
    			add_location(div0, file$1, 10, 4, 326);
    			attr_dev(h1, "class", "text-blue-700 text-3xl");
    			add_location(h1, file$1, 15, 4, 493);
    			attr_dev(div1, "class", div1_class_value = /*spellOptionsMenu*/ ctx[0] ? "invisible" : "");
    			attr_dev(div1, "data-testid", "sourceOptionsMenuDiv");
    			add_location(div1, file$1, 16, 4, 547);
    			attr_dev(nav, "class", "flex justify-between w-full");
    			add_location(nav, file$1, 9, 2, 280);
    			attr_dev(header, "class", "flex justify-between bg-gray-200 p-2 items-center text-gray-600\n    border-b-2");
    			add_location(header, file$1, 6, 0, 180);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, nav);
    			append_dev(nav, div0);
    			mount_component(hamburgerbutton0, div0, null);
    			append_dev(nav, t0);
    			append_dev(nav, h1);
    			append_dev(h1, t1);
    			append_dev(nav, t2);
    			append_dev(nav, div1);
    			mount_component(hamburgerbutton1, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const hamburgerbutton0_changes = {};

    			if (!updating_open && dirty & /*spellOptionsMenu*/ 1) {
    				updating_open = true;
    				hamburgerbutton0_changes.open = /*spellOptionsMenu*/ ctx[0];
    				add_flush_callback(() => updating_open = false);
    			}

    			hamburgerbutton0.$set(hamburgerbutton0_changes);

    			if (!current || dirty & /*sourceOptionsMenu*/ 2 && div0_class_value !== (div0_class_value = /*sourceOptionsMenu*/ ctx[1] ? "invisible" : "")) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			if (!current || dirty & /*heading*/ 4) set_data_dev(t1, /*heading*/ ctx[2]);
    			const hamburgerbutton1_changes = {};

    			if (!updating_open_1 && dirty & /*sourceOptionsMenu*/ 2) {
    				updating_open_1 = true;
    				hamburgerbutton1_changes.open = /*sourceOptionsMenu*/ ctx[1];
    				add_flush_callback(() => updating_open_1 = false);
    			}

    			hamburgerbutton1.$set(hamburgerbutton1_changes);

    			if (!current || dirty & /*spellOptionsMenu*/ 1 && div1_class_value !== (div1_class_value = /*spellOptionsMenu*/ ctx[0] ? "invisible" : "")) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(hamburgerbutton0.$$.fragment, local);
    			transition_in(hamburgerbutton1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(hamburgerbutton0.$$.fragment, local);
    			transition_out(hamburgerbutton1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			destroy_component(hamburgerbutton0);
    			destroy_component(hamburgerbutton1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Navbar", slots, []);
    	let { heading } = $$props;
    	let { spellOptionsMenu = false } = $$props;
    	let { sourceOptionsMenu = false } = $$props;
    	const writable_props = ["heading", "spellOptionsMenu", "sourceOptionsMenu"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Navbar> was created with unknown prop '${key}'`);
    	});

    	function hamburgerbutton0_open_binding(value) {
    		spellOptionsMenu = value;
    		$$invalidate(0, spellOptionsMenu);
    	}

    	function hamburgerbutton1_open_binding(value) {
    		sourceOptionsMenu = value;
    		$$invalidate(1, sourceOptionsMenu);
    	}

    	$$self.$$set = $$props => {
    		if ("heading" in $$props) $$invalidate(2, heading = $$props.heading);
    		if ("spellOptionsMenu" in $$props) $$invalidate(0, spellOptionsMenu = $$props.spellOptionsMenu);
    		if ("sourceOptionsMenu" in $$props) $$invalidate(1, sourceOptionsMenu = $$props.sourceOptionsMenu);
    	};

    	$$self.$capture_state = () => ({
    		HamburgerButton,
    		heading,
    		spellOptionsMenu,
    		sourceOptionsMenu
    	});

    	$$self.$inject_state = $$props => {
    		if ("heading" in $$props) $$invalidate(2, heading = $$props.heading);
    		if ("spellOptionsMenu" in $$props) $$invalidate(0, spellOptionsMenu = $$props.spellOptionsMenu);
    		if ("sourceOptionsMenu" in $$props) $$invalidate(1, sourceOptionsMenu = $$props.sourceOptionsMenu);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		spellOptionsMenu,
    		sourceOptionsMenu,
    		heading,
    		hamburgerbutton0_open_binding,
    		hamburgerbutton1_open_binding
    	];
    }

    class Navbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			heading: 2,
    			spellOptionsMenu: 0,
    			sourceOptionsMenu: 1
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navbar",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*heading*/ ctx[2] === undefined && !("heading" in props)) {
    			console.warn("<Navbar> was created without expected prop 'heading'");
    		}
    	}

    	get heading() {
    		throw new Error("<Navbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set heading(value) {
    		throw new Error("<Navbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get spellOptionsMenu() {
    		throw new Error("<Navbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set spellOptionsMenu(value) {
    		throw new Error("<Navbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sourceOptionsMenu() {
    		throw new Error("<Navbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sourceOptionsMenu(value) {
    		throw new Error("<Navbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Sidebar.svelte generated by Svelte v3.26.0 */

    const file$2 = "src/components/Sidebar.svelte";

    // (33:2) {#if title}
    function create_if_block(ctx) {
    	let h2;
    	let t;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			t = text(/*title*/ ctx[1]);
    			attr_dev(h2, "class", "absolute");
    			add_location(h2, file$2, 33, 4, 507);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			append_dev(h2, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*title*/ 2) set_data_dev(t, /*title*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(33:2) {#if title}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let aside;
    	let t;
    	let current;
    	let if_block = /*title*/ ctx[1] && create_if_block(ctx);
    	const default_slot_template = /*#slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

    	const block = {
    		c: function create() {
    			aside = element("aside");
    			if (if_block) if_block.c();
    			t = space();
    			if (default_slot) default_slot.c();
    			attr_dev(aside, "class", "fixed w-full h-full bg-gray-200 border-r-2 shadow-lg overflow-auto\n    box-border svelte-zcncv0");
    			toggle_class(aside, "open", /*open*/ ctx[0]);
    			toggle_class(aside, "right", /*right*/ ctx[3]);
    			toggle_class(aside, "left", /*left*/ ctx[2]);
    			add_location(aside, file$2, 26, 0, 349);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, aside, anchor);
    			if (if_block) if_block.m(aside, null);
    			append_dev(aside, t);

    			if (default_slot) {
    				default_slot.m(aside, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*title*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(aside, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 16) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[4], dirty, null, null);
    				}
    			}

    			if (dirty & /*open*/ 1) {
    				toggle_class(aside, "open", /*open*/ ctx[0]);
    			}

    			if (dirty & /*right*/ 8) {
    				toggle_class(aside, "right", /*right*/ ctx[3]);
    			}

    			if (dirty & /*left*/ 4) {
    				toggle_class(aside, "left", /*left*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(aside);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Sidebar", slots, ['default']);
    	let { open = false } = $$props;
    	let { title = "" } = $$props;
    	let { left = true } = $$props;
    	const writable_props = ["open", "title", "left"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Sidebar> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("open" in $$props) $$invalidate(0, open = $$props.open);
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    		if ("left" in $$props) $$invalidate(2, left = $$props.left);
    		if ("$$scope" in $$props) $$invalidate(4, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ open, title, left, right });

    	$$self.$inject_state = $$props => {
    		if ("open" in $$props) $$invalidate(0, open = $$props.open);
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    		if ("left" in $$props) $$invalidate(2, left = $$props.left);
    		if ("right" in $$props) $$invalidate(3, right = $$props.right);
    	};

    	let right;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*left*/ 4) {
    			 $$invalidate(3, right = !left);
    		}
    	};

    	return [open, title, left, right, $$scope, slots];
    }

    class Sidebar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { open: 0, title: 1, left: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Sidebar",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get open() {
    		throw new Error("<Sidebar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set open(value) {
    		throw new Error("<Sidebar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Sidebar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Sidebar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get left() {
    		throw new Error("<Sidebar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set left(value) {
    		throw new Error("<Sidebar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/SelectSpellParameters.svelte generated by Svelte v3.26.0 */
    const file$3 = "src/components/SelectSpellParameters.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	return child_ctx;
    }

    // (22:4) {#each spellOptions as spell}
    function create_each_block_2(ctx) {
    	let option;
    	let t_value = /*spell*/ ctx[15] + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*spell*/ ctx[15];
    			option.value = option.__value;
    			add_location(option, file$3, 22, 6, 686);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(22:4) {#each spellOptions as spell}",
    		ctx
    	});

    	return block;
    }

    // (35:4) {#each crOptions as cr}
    function create_each_block_1(ctx) {
    	let option;
    	let t_value = /*cr*/ ctx[12] + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*cr*/ ctx[12];
    			option.value = option.__value;
    			add_location(option, file$3, 35, 6, 1058);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(35:4) {#each crOptions as cr}",
    		ctx
    	});

    	return block;
    }

    // (41:2) {#each terrainOptions as terrain}
    function create_each_block(ctx) {
    	let label;
    	let input;
    	let input_value_value;
    	let t0;
    	let t1_value = /*terrain*/ ctx[9] + "";
    	let t1;
    	let t2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			label = element("label");
    			input = element("input");
    			t0 = space();
    			t1 = text(t1_value);
    			t2 = space();
    			attr_dev(input, "type", "checkbox");
    			input.__value = input_value_value = /*terrain*/ ctx[9];
    			input.value = input.__value;
    			/*$$binding_groups*/ ctx[8][0].push(input);
    			add_location(input, file$3, 42, 6, 1256);
    			attr_dev(label, "class", "text-lg my-1 mx-2");
    			add_location(label, file$3, 41, 4, 1216);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, input);
    			input.checked = ~/*$writeSpellParameters*/ ctx[1].terrains.indexOf(input.__value);
    			append_dev(label, t0);
    			append_dev(label, t1);
    			append_dev(label, t2);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*input_change_handler*/ ctx[7]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$writeSpellParameters, spellOptions*/ 6) {
    				input.checked = ~/*$writeSpellParameters*/ ctx[1].terrains.indexOf(input.__value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			/*$$binding_groups*/ ctx[8][0].splice(/*$$binding_groups*/ ctx[8][0].indexOf(input), 1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(41:2) {#each terrainOptions as terrain}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let h20;
    	let t0;
    	let t1;
    	let form;
    	let label0;
    	let t3;
    	let select0;
    	let t4;
    	let label1;
    	let t6;
    	let select1;
    	let t7;
    	let h21;
    	let t9;
    	let mounted;
    	let dispose;
    	let each_value_2 = /*spellOptions*/ ctx[2];
    	validate_each_argument(each_value_2);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_2[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let each_value_1 = /*crOptions*/ ctx[3];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*terrainOptions*/ ctx[4];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			h20 = element("h2");
    			t0 = text(/*heading*/ ctx[0]);
    			t1 = space();
    			form = element("form");
    			label0 = element("label");
    			label0.textContent = "Spell";
    			t3 = space();
    			select0 = element("select");

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t4 = space();
    			label1 = element("label");
    			label1.textContent = "Challenge Rating of Creatures";
    			t6 = space();
    			select1 = element("select");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t7 = space();
    			h21 = element("h2");
    			h21.textContent = "Terrains";
    			t9 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h20, "class", "text-blue-700 text-2xl mx-2");
    			add_location(h20, file$3, 11, 0, 349);
    			attr_dev(label0, "for", "spell-select");
    			attr_dev(label0, "class", "text-gray-700 text-xl my-1 mx-2");
    			add_location(label0, file$3, 13, 2, 437);
    			attr_dev(select0, "id", "spell-select");
    			attr_dev(select0, "name", "spell");
    			attr_dev(select0, "class", "my-1 mx-2");
    			if (/*$writeSpellParameters*/ ctx[1].spellName === void 0) add_render_callback(() => /*select0_change_handler*/ ctx[5].call(select0));
    			add_location(select0, file$3, 16, 2, 527);
    			attr_dev(label1, "for", "challenge-rating-select");
    			attr_dev(label1, "class", "text-gray-700 text-xl my-1 mx-2");
    			add_location(label1, file$3, 26, 2, 752);
    			attr_dev(select1, "id", "challenge-rating-select");
    			attr_dev(select1, "class", "my-1 mx-2");
    			attr_dev(select1, "name", "challenge-rating");
    			if (/*$writeSpellParameters*/ ctx[1].challengeRating === void 0) add_render_callback(() => /*select1_change_handler*/ ctx[6].call(select1));
    			add_location(select1, file$3, 29, 2, 877);
    			attr_dev(h21, "class", "text-gray-700 text-xl my-1 mx-2");
    			add_location(h21, file$3, 39, 2, 1118);
    			attr_dev(form, "name", "spell-parameters");
    			add_location(form, file$3, 12, 0, 404);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h20, anchor);
    			append_dev(h20, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, form, anchor);
    			append_dev(form, label0);
    			append_dev(form, t3);
    			append_dev(form, select0);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(select0, null);
    			}

    			select_option(select0, /*$writeSpellParameters*/ ctx[1].spellName);
    			append_dev(form, t4);
    			append_dev(form, label1);
    			append_dev(form, t6);
    			append_dev(form, select1);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(select1, null);
    			}

    			select_option(select1, /*$writeSpellParameters*/ ctx[1].challengeRating);
    			append_dev(form, t7);
    			append_dev(form, h21);
    			append_dev(form, t9);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(form, null);
    			}

    			if (!mounted) {
    				dispose = [
    					listen_dev(select0, "change", /*select0_change_handler*/ ctx[5]),
    					listen_dev(select1, "change", /*select1_change_handler*/ ctx[6])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*heading*/ 1) set_data_dev(t0, /*heading*/ ctx[0]);

    			if (dirty & /*spellOptions*/ 4) {
    				each_value_2 = /*spellOptions*/ ctx[2];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_2[i] = create_each_block_2(child_ctx);
    						each_blocks_2[i].c();
    						each_blocks_2[i].m(select0, null);
    					}
    				}

    				for (; i < each_blocks_2.length; i += 1) {
    					each_blocks_2[i].d(1);
    				}

    				each_blocks_2.length = each_value_2.length;
    			}

    			if (dirty & /*$writeSpellParameters, spellOptions*/ 6) {
    				select_option(select0, /*$writeSpellParameters*/ ctx[1].spellName);
    			}

    			if (dirty & /*crOptions*/ 8) {
    				each_value_1 = /*crOptions*/ ctx[3];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(select1, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*$writeSpellParameters, spellOptions*/ 6) {
    				select_option(select1, /*$writeSpellParameters*/ ctx[1].challengeRating);
    			}

    			if (dirty & /*terrainOptions, $writeSpellParameters*/ 18) {
    				each_value = /*terrainOptions*/ ctx[4];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(form, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h20);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(form);
    			destroy_each(each_blocks_2, detaching);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $writeSpellParameters;
    	validate_store(writeSpellParameters, "writeSpellParameters");
    	component_subscribe($$self, writeSpellParameters, $$value => $$invalidate(1, $writeSpellParameters = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SelectSpellParameters", slots, []);
    	let { heading = "Spell Parameters" } = $$props;
    	const spellOptions = ["Conjure Animals", "Conjure Woodland Beings", "Conjure Minor Elementals"];
    	const crOptions = [0, 0.125, 0.25, 0.5, 1, 2];
    	const terrainOptions = ["Land", "Water", "Air"];
    	const writable_props = ["heading"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SelectSpellParameters> was created with unknown prop '${key}'`);
    	});

    	const $$binding_groups = [[]];

    	function select0_change_handler() {
    		$writeSpellParameters.spellName = select_value(this);
    		writeSpellParameters.set($writeSpellParameters);
    		$$invalidate(2, spellOptions);
    	}

    	function select1_change_handler() {
    		$writeSpellParameters.challengeRating = select_value(this);
    		writeSpellParameters.set($writeSpellParameters);
    		$$invalidate(2, spellOptions);
    	}

    	function input_change_handler() {
    		$writeSpellParameters.terrains = get_binding_group_value($$binding_groups[0], this.__value, this.checked);
    		writeSpellParameters.set($writeSpellParameters);
    		$$invalidate(2, spellOptions);
    	}

    	$$self.$$set = $$props => {
    		if ("heading" in $$props) $$invalidate(0, heading = $$props.heading);
    	};

    	$$self.$capture_state = () => ({
    		writeSpellParameters,
    		heading,
    		spellOptions,
    		crOptions,
    		terrainOptions,
    		$writeSpellParameters
    	});

    	$$self.$inject_state = $$props => {
    		if ("heading" in $$props) $$invalidate(0, heading = $$props.heading);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		heading,
    		$writeSpellParameters,
    		spellOptions,
    		crOptions,
    		terrainOptions,
    		select0_change_handler,
    		select1_change_handler,
    		input_change_handler,
    		$$binding_groups
    	];
    }

    class SelectSpellParameters extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { heading: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SelectSpellParameters",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get heading() {
    		throw new Error("<SelectSpellParameters>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set heading(value) {
    		throw new Error("<SelectSpellParameters>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/SelectSourcebooks.svelte generated by Svelte v3.26.0 */

    const { Object: Object_1 } = globals;
    const file$4 = "src/components/SelectSourcebooks.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (14:4) {#each sourceBookTitles as sourcebook}
    function create_each_block$1(ctx) {
    	let label;
    	let input;
    	let input_value_value;
    	let t0;
    	let t1_value = /*sourcebook*/ ctx[5] + "";
    	let t1;
    	let t2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			label = element("label");
    			input = element("input");
    			t0 = space();
    			t1 = text(t1_value);
    			t2 = space();
    			attr_dev(input, "type", "checkbox");
    			input.__value = input_value_value = /*sourcebook*/ ctx[5];
    			input.value = input.__value;
    			/*$$binding_groups*/ ctx[4][0].push(input);
    			add_location(input, file$4, 15, 8, 551);
    			attr_dev(label, "class", "text-lg mx-2 my-1");
    			add_location(label, file$4, 14, 6, 509);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, input);
    			input.checked = ~/*$writeSourcebooks*/ ctx[1].indexOf(input.__value);
    			append_dev(label, t0);
    			append_dev(label, t1);
    			append_dev(label, t2);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*input_change_handler*/ ctx[3]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$writeSourcebooks*/ 2) {
    				input.checked = ~/*$writeSourcebooks*/ ctx[1].indexOf(input.__value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			/*$$binding_groups*/ ctx[4][0].splice(/*$$binding_groups*/ ctx[4][0].indexOf(input), 1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(14:4) {#each sourceBookTitles as sourcebook}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let h2;
    	let t0;
    	let t1;
    	let div;
    	let form;
    	let each_value = /*sourceBookTitles*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			t0 = text(/*heading*/ ctx[0]);
    			t1 = space();
    			div = element("div");
    			form = element("form");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h2, "class", "text-blue-700 text-2xl mx-2");
    			add_location(h2, file$4, 6, 0, 219);
    			attr_dev(form, "name", "sourcebooks");
    			attr_dev(form, "id", "select-sourcebooks");
    			attr_dev(form, "class", "overflow-visible overflow-auto box-border pb-8");
    			add_location(form, file$4, 9, 2, 343);
    			attr_dev(div, "class", "overflow-visible overflow-auto box-border pb-8 mb-4");
    			add_location(div, file$4, 8, 0, 275);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			append_dev(h2, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, form);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(form, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*heading*/ 1) set_data_dev(t0, /*heading*/ ctx[0]);

    			if (dirty & /*sourceBookTitles, $writeSourcebooks*/ 6) {
    				each_value = /*sourceBookTitles*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(form, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $writeSourcebooks;
    	validate_store(writeSourcebooks, "writeSourcebooks");
    	component_subscribe($$self, writeSourcebooks, $$value => $$invalidate(1, $writeSourcebooks = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SelectSourcebooks", slots, []);
    	let { heading = "Sourcebooks" } = $$props;
    	let sourceBookTitles = Object.values(src.sources).sort();
    	const writable_props = ["heading"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SelectSourcebooks> was created with unknown prop '${key}'`);
    	});

    	const $$binding_groups = [[]];

    	function input_change_handler() {
    		$writeSourcebooks = get_binding_group_value($$binding_groups[0], this.__value, this.checked);
    		writeSourcebooks.set($writeSourcebooks);
    	}

    	$$self.$$set = $$props => {
    		if ("heading" in $$props) $$invalidate(0, heading = $$props.heading);
    	};

    	$$self.$capture_state = () => ({
    		writeSourcebooks,
    		sources: src.sources,
    		heading,
    		sourceBookTitles,
    		$writeSourcebooks
    	});

    	$$self.$inject_state = $$props => {
    		if ("heading" in $$props) $$invalidate(0, heading = $$props.heading);
    		if ("sourceBookTitles" in $$props) $$invalidate(2, sourceBookTitles = $$props.sourceBookTitles);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		heading,
    		$writeSourcebooks,
    		sourceBookTitles,
    		input_change_handler,
    		$$binding_groups
    	];
    }

    class SelectSourcebooks extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { heading: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SelectSourcebooks",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get heading() {
    		throw new Error("<SelectSourcebooks>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set heading(value) {
    		throw new Error("<SelectSourcebooks>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/ResultBox.svelte generated by Svelte v3.26.0 */

    const file$5 = "src/components/ResultBox.svelte";

    function create_fragment$5(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "box svelte-15i5ke2");
    			add_location(div, file$5, 11, 0, 191);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[0], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ResultBox", slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ResultBox> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class ResultBox extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ResultBox",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.26.0 */
    const file$6 = "src/App.svelte";

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	return child_ctx;
    }

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	return child_ctx;
    }

    // (48:0) <Sidebar bind:open={leftSidebarIsOpen}>
    function create_default_slot_2(ctx) {
    	let selectspellparameters;
    	let current;
    	selectspellparameters = new SelectSpellParameters({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(selectspellparameters.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(selectspellparameters, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(selectspellparameters.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(selectspellparameters.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(selectspellparameters, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(48:0) <Sidebar bind:open={leftSidebarIsOpen}>",
    		ctx
    	});

    	return block;
    }

    // (51:0) <Sidebar bind:open={rightSidebarIsOpen} left={false}>
    function create_default_slot_1(ctx) {
    	let selectsourcebooks;
    	let current;
    	selectsourcebooks = new SelectSourcebooks({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(selectsourcebooks.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(selectsourcebooks, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(selectsourcebooks.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(selectsourcebooks.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(selectsourcebooks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(51:0) <Sidebar bind:open={rightSidebarIsOpen} left={false}>",
    		ctx
    	});

    	return block;
    }

    // (67:8) {#each result as creature}
    function create_each_block_1$1(ctx) {
    	let li;
    	let t_value = /*creature*/ ctx[15] + "";
    	let t;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t = text(t_value);
    			add_location(li, file$6, 67, 10, 2235);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*results*/ 4 && t_value !== (t_value = /*creature*/ ctx[15] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(67:8) {#each result as creature}",
    		ctx
    	});

    	return block;
    }

    // (65:4) <ResultBox>
    function create_default_slot(ctx) {
    	let ul;
    	let t;
    	let each_value_1 = /*result*/ ctx[12];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			add_location(ul, file$6, 65, 6, 2185);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*results*/ 4) {
    				each_value_1 = /*result*/ ctx[12];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(65:4) <ResultBox>",
    		ctx
    	});

    	return block;
    }

    // (64:2) {#each results as result}
    function create_each_block$2(ctx) {
    	let resultbox;
    	let current;

    	resultbox = new ResultBox({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(resultbox.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(resultbox, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const resultbox_changes = {};

    			if (dirty & /*$$scope, results*/ 262148) {
    				resultbox_changes.$$scope = { dirty, ctx };
    			}

    			resultbox.$set(resultbox_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(resultbox.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(resultbox.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(resultbox, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(64:2) {#each results as result}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let link;
    	let t0;
    	let navbar;
    	let updating_spellOptionsMenu;
    	let updating_sourceOptionsMenu;
    	let t1;
    	let sidebar0;
    	let updating_open;
    	let t2;
    	let sidebar1;
    	let updating_open_1;
    	let t3;
    	let div0;
    	let button;
    	let t5;
    	let div1;
    	let current;
    	let mounted;
    	let dispose;

    	function navbar_spellOptionsMenu_binding(value) {
    		/*navbar_spellOptionsMenu_binding*/ ctx[5].call(null, value);
    	}

    	function navbar_sourceOptionsMenu_binding(value) {
    		/*navbar_sourceOptionsMenu_binding*/ ctx[6].call(null, value);
    	}

    	let navbar_props = {
    		heading: "Conjure5e" + (/*appVersion*/ ctx[3] ? ` ${/*appVersion*/ ctx[3]}` : "")
    	};

    	if (/*leftSidebarIsOpen*/ ctx[0] !== void 0) {
    		navbar_props.spellOptionsMenu = /*leftSidebarIsOpen*/ ctx[0];
    	}

    	if (/*rightSidebarIsOpen*/ ctx[1] !== void 0) {
    		navbar_props.sourceOptionsMenu = /*rightSidebarIsOpen*/ ctx[1];
    	}

    	navbar = new Navbar({ props: navbar_props, $$inline: true });
    	binding_callbacks.push(() => bind(navbar, "spellOptionsMenu", navbar_spellOptionsMenu_binding));
    	binding_callbacks.push(() => bind(navbar, "sourceOptionsMenu", navbar_sourceOptionsMenu_binding));

    	function sidebar0_open_binding(value) {
    		/*sidebar0_open_binding*/ ctx[7].call(null, value);
    	}

    	let sidebar0_props = {
    		$$slots: { default: [create_default_slot_2] },
    		$$scope: { ctx }
    	};

    	if (/*leftSidebarIsOpen*/ ctx[0] !== void 0) {
    		sidebar0_props.open = /*leftSidebarIsOpen*/ ctx[0];
    	}

    	sidebar0 = new Sidebar({ props: sidebar0_props, $$inline: true });
    	binding_callbacks.push(() => bind(sidebar0, "open", sidebar0_open_binding));

    	function sidebar1_open_binding(value) {
    		/*sidebar1_open_binding*/ ctx[8].call(null, value);
    	}

    	let sidebar1_props = {
    		left: false,
    		$$slots: { default: [create_default_slot_1] },
    		$$scope: { ctx }
    	};

    	if (/*rightSidebarIsOpen*/ ctx[1] !== void 0) {
    		sidebar1_props.open = /*rightSidebarIsOpen*/ ctx[1];
    	}

    	sidebar1 = new Sidebar({ props: sidebar1_props, $$inline: true });
    	binding_callbacks.push(() => bind(sidebar1, "open", sidebar1_open_binding));
    	let each_value = /*results*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			link = element("link");
    			t0 = space();
    			create_component(navbar.$$.fragment);
    			t1 = space();
    			create_component(sidebar0.$$.fragment);
    			t2 = space();
    			create_component(sidebar1.$$.fragment);
    			t3 = space();
    			div0 = element("div");
    			button = element("button");
    			button.textContent = "Cast Spell";
    			t5 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(link, "href", "https://unpkg.com/tailwindcss@^1.0/dist/tailwind.min.css");
    			attr_dev(link, "rel", "stylesheet");
    			add_location(link, file$6, 39, 2, 1353);
    			attr_dev(button, "name", "cast-spell");
    			attr_dev(button, "id", "cast-spell-button");
    			attr_dev(button, "class", "bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4\n      border border-gray-400 rounded shadow");
    			add_location(button, file$6, 55, 2, 1834);
    			attr_dev(div0, "class", "flex justify-center m-4");
    			add_location(div0, file$6, 54, 0, 1794);
    			attr_dev(div1, "class", "flex flex-col justify-center items-center text-center");
    			add_location(div1, file$6, 62, 0, 2067);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, link);
    			insert_dev(target, t0, anchor);
    			mount_component(navbar, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(sidebar0, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(sidebar1, target, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div0, anchor);
    			append_dev(div0, button);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[9], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const navbar_changes = {};

    			if (!updating_spellOptionsMenu && dirty & /*leftSidebarIsOpen*/ 1) {
    				updating_spellOptionsMenu = true;
    				navbar_changes.spellOptionsMenu = /*leftSidebarIsOpen*/ ctx[0];
    				add_flush_callback(() => updating_spellOptionsMenu = false);
    			}

    			if (!updating_sourceOptionsMenu && dirty & /*rightSidebarIsOpen*/ 2) {
    				updating_sourceOptionsMenu = true;
    				navbar_changes.sourceOptionsMenu = /*rightSidebarIsOpen*/ ctx[1];
    				add_flush_callback(() => updating_sourceOptionsMenu = false);
    			}

    			navbar.$set(navbar_changes);
    			const sidebar0_changes = {};

    			if (dirty & /*$$scope*/ 262144) {
    				sidebar0_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_open && dirty & /*leftSidebarIsOpen*/ 1) {
    				updating_open = true;
    				sidebar0_changes.open = /*leftSidebarIsOpen*/ ctx[0];
    				add_flush_callback(() => updating_open = false);
    			}

    			sidebar0.$set(sidebar0_changes);
    			const sidebar1_changes = {};

    			if (dirty & /*$$scope*/ 262144) {
    				sidebar1_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_open_1 && dirty & /*rightSidebarIsOpen*/ 2) {
    				updating_open_1 = true;
    				sidebar1_changes.open = /*rightSidebarIsOpen*/ ctx[1];
    				add_flush_callback(() => updating_open_1 = false);
    			}

    			sidebar1.$set(sidebar1_changes);

    			if (dirty & /*results*/ 4) {
    				each_value = /*results*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div1, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(sidebar0.$$.fragment, local);
    			transition_in(sidebar1.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(sidebar0.$$.fragment, local);
    			transition_out(sidebar1.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			detach_dev(link);
    			if (detaching) detach_dev(t0);
    			destroy_component(navbar, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(sidebar0, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(sidebar1, detaching);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let $readSpellParameters;
    	let $readSourcebooks;
    	validate_store(readSpellParameters, "readSpellParameters");
    	component_subscribe($$self, readSpellParameters, $$value => $$invalidate(10, $readSpellParameters = $$value));
    	validate_store(readSourcebooks, "readSourcebooks");
    	component_subscribe($$self, readSourcebooks, $$value => $$invalidate(11, $readSourcebooks = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let { leftSidebarIsOpen = false } = $$props;
    	let { rightSidebarIsOpen = false } = $$props;
    	let results = [];
    	const appVersion = packageVersion();

    	function cast() {
    		let spell;

    		if ($readSpellParameters.spellName === "Conjure Animals") {
    			spell = src.conjureAnimals;
    		} else if ($readSpellParameters.spellName === "Conjure Woodland Beings") {
    			spell = src.conjureWoodlandBeings;
    		} else {
    			spell = src.conjureMinorElementals;
    		}

    		const { terrains, challengeRating } = $readSpellParameters;
    		const sources = $readSourcebooks;
    		const result = spell({ terrains, challengeRating, sources }).map(creature => creature.name);
    		$$invalidate(2, results = [result, ...results]);
    	}

    	const writable_props = ["leftSidebarIsOpen", "rightSidebarIsOpen"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function navbar_spellOptionsMenu_binding(value) {
    		leftSidebarIsOpen = value;
    		$$invalidate(0, leftSidebarIsOpen);
    	}

    	function navbar_sourceOptionsMenu_binding(value) {
    		rightSidebarIsOpen = value;
    		$$invalidate(1, rightSidebarIsOpen);
    	}

    	function sidebar0_open_binding(value) {
    		leftSidebarIsOpen = value;
    		$$invalidate(0, leftSidebarIsOpen);
    	}

    	function sidebar1_open_binding(value) {
    		rightSidebarIsOpen = value;
    		$$invalidate(1, rightSidebarIsOpen);
    	}

    	const click_handler = () => cast();

    	$$self.$$set = $$props => {
    		if ("leftSidebarIsOpen" in $$props) $$invalidate(0, leftSidebarIsOpen = $$props.leftSidebarIsOpen);
    		if ("rightSidebarIsOpen" in $$props) $$invalidate(1, rightSidebarIsOpen = $$props.rightSidebarIsOpen);
    	};

    	$$self.$capture_state = () => ({
    		readSourcebooks,
    		readSpellParameters,
    		conjureAnimals: src.conjureAnimals,
    		conjureMinorElementals: src.conjureMinorElementals,
    		conjureWoodlandBeings: src.conjureWoodlandBeings,
    		packageVersion,
    		Navbar,
    		Sidebar,
    		SelectSpellParameters,
    		SelectSourcebooks,
    		ResultBox,
    		leftSidebarIsOpen,
    		rightSidebarIsOpen,
    		results,
    		appVersion,
    		cast,
    		$readSpellParameters,
    		$readSourcebooks
    	});

    	$$self.$inject_state = $$props => {
    		if ("leftSidebarIsOpen" in $$props) $$invalidate(0, leftSidebarIsOpen = $$props.leftSidebarIsOpen);
    		if ("rightSidebarIsOpen" in $$props) $$invalidate(1, rightSidebarIsOpen = $$props.rightSidebarIsOpen);
    		if ("results" in $$props) $$invalidate(2, results = $$props.results);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		leftSidebarIsOpen,
    		rightSidebarIsOpen,
    		results,
    		appVersion,
    		cast,
    		navbar_spellOptionsMenu_binding,
    		navbar_sourceOptionsMenu_binding,
    		sidebar0_open_binding,
    		sidebar1_open_binding,
    		click_handler
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			leftSidebarIsOpen: 0,
    			rightSidebarIsOpen: 1
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get leftSidebarIsOpen() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set leftSidebarIsOpen(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rightSidebarIsOpen() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rightSidebarIsOpen(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
        target: document.body,
        props: {},
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
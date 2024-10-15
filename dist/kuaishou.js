(function () {
	'use strict';

	function getDefaultExportFromCjs (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	function _typeof(o) {
	  "@babel/helpers - typeof";

	  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
	    return typeof o;
	  } : function (o) {
	    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
	  }, _typeof(o);
	}

	var mixin;
	var hasRequiredMixin;
	function requireMixin() {
	  if (hasRequiredMixin) return mixin;
	  hasRequiredMixin = 1;
	  mixin = function mixin(target, sources) {
	    var n, source, key;
	    for (n = 1; n < arguments.length; n++) {
	      source = arguments[n];
	      for (key in source) {
	        if (source.hasOwnProperty(key)) target[key] = source[key];
	      }
	    }
	    return target;
	  };
	  return mixin;
	}

	var camelize_1;
	var hasRequiredCamelize;
	function requireCamelize() {
	  if (hasRequiredCamelize) return camelize_1;
	  hasRequiredCamelize = 1;

	  //-------------------------------------------------------------------------------------------------

	  function camelize(label) {
	    if (label.length === 0) return label;
	    var n,
	      result,
	      words = label.split(/[_-]/);

	    // single word with first character already lowercase, return untouched
	    if (words.length === 1 && words[0][0].toLowerCase() === words[0][0]) return label;
	    result = words[0].toLowerCase();
	    for (n = 1; n < words.length; n++) {
	      result = result + words[n].charAt(0).toUpperCase() + words[n].substring(1).toLowerCase();
	    }
	    return result;
	  }

	  //-------------------------------------------------------------------------------------------------

	  camelize.prepended = function (prepend, label) {
	    label = camelize(label);
	    return prepend + label[0].toUpperCase() + label.substring(1);
	  };

	  //-------------------------------------------------------------------------------------------------

	  camelize_1 = camelize;
	  return camelize_1;
	}

	var plugin;
	var hasRequiredPlugin;
	function requirePlugin() {
	  if (hasRequiredPlugin) return plugin;
	  hasRequiredPlugin = 1;

	  //-------------------------------------------------------------------------------------------------

	  var mixin = requireMixin();

	  //-------------------------------------------------------------------------------------------------

	  plugin = {
	    build: function build(target, config) {
	      var n,
	        max,
	        plugin,
	        plugins = config.plugins;
	      for (n = 0, max = plugins.length; n < max; n++) {
	        plugin = plugins[n];
	        if (plugin.methods) mixin(target, plugin.methods);
	        if (plugin.properties) Object.defineProperties(target, plugin.properties);
	      }
	    },
	    hook: function hook(fsm, name, additional) {
	      var n,
	        max,
	        method,
	        plugin,
	        plugins = fsm.config.plugins,
	        args = [fsm.context];
	      if (additional) args = args.concat(additional);
	      for (n = 0, max = plugins.length; n < max; n++) {
	        plugin = plugins[n];
	        method = plugins[n][name];
	        if (method) method.apply(plugin, args);
	      }
	    }
	  };

	  //-------------------------------------------------------------------------------------------------
	  return plugin;
	}

	var config;
	var hasRequiredConfig;
	function requireConfig() {
	  if (hasRequiredConfig) return config;
	  hasRequiredConfig = 1;

	  //-------------------------------------------------------------------------------------------------

	  var mixin = requireMixin(),
	    camelize = requireCamelize();

	  //-------------------------------------------------------------------------------------------------

	  function Config(options, StateMachine) {
	    options = options || {};
	    this.options = options; // preserving original options can be useful (e.g visualize plugin)
	    this.defaults = StateMachine.defaults;
	    this.states = [];
	    this.transitions = [];
	    this.map = {};
	    this.lifecycle = this.configureLifecycle();
	    this.init = this.configureInitTransition(options.init);
	    this.data = this.configureData(options.data);
	    this.methods = this.configureMethods(options.methods);
	    this.map[this.defaults.wildcard] = {};
	    this.configureTransitions(options.transitions || []);
	    this.plugins = this.configurePlugins(options.plugins, StateMachine.plugin);
	  }

	  //-------------------------------------------------------------------------------------------------

	  mixin(Config.prototype, {
	    addState: function addState(name) {
	      if (!this.map[name]) {
	        this.states.push(name);
	        this.addStateLifecycleNames(name);
	        this.map[name] = {};
	      }
	    },
	    addStateLifecycleNames: function addStateLifecycleNames(name) {
	      this.lifecycle.onEnter[name] = camelize.prepended('onEnter', name);
	      this.lifecycle.onLeave[name] = camelize.prepended('onLeave', name);
	      this.lifecycle.on[name] = camelize.prepended('on', name);
	    },
	    addTransition: function addTransition(name) {
	      if (this.transitions.indexOf(name) < 0) {
	        this.transitions.push(name);
	        this.addTransitionLifecycleNames(name);
	      }
	    },
	    addTransitionLifecycleNames: function addTransitionLifecycleNames(name) {
	      this.lifecycle.onBefore[name] = camelize.prepended('onBefore', name);
	      this.lifecycle.onAfter[name] = camelize.prepended('onAfter', name);
	      this.lifecycle.on[name] = camelize.prepended('on', name);
	    },
	    mapTransition: function mapTransition(transition) {
	      var name = transition.name,
	        from = transition.from,
	        to = transition.to;
	      this.addState(from);
	      if (typeof to !== 'function') this.addState(to);
	      this.addTransition(name);
	      this.map[from][name] = transition;
	      return transition;
	    },
	    configureLifecycle: function configureLifecycle() {
	      return {
	        onBefore: {
	          transition: 'onBeforeTransition'
	        },
	        onAfter: {
	          transition: 'onAfterTransition'
	        },
	        onEnter: {
	          state: 'onEnterState'
	        },
	        onLeave: {
	          state: 'onLeaveState'
	        },
	        on: {
	          transition: 'onTransition'
	        }
	      };
	    },
	    configureInitTransition: function configureInitTransition(init) {
	      if (typeof init === 'string') {
	        return this.mapTransition(mixin({}, this.defaults.init, {
	          to: init,
	          active: true
	        }));
	      } else if (_typeof(init) === 'object') {
	        return this.mapTransition(mixin({}, this.defaults.init, init, {
	          active: true
	        }));
	      } else {
	        this.addState(this.defaults.init.from);
	        return this.defaults.init;
	      }
	    },
	    configureData: function configureData(data) {
	      if (typeof data === 'function') return data;else if (_typeof(data) === 'object') return function () {
	        return data;
	      };else return function () {
	        return {};
	      };
	    },
	    configureMethods: function configureMethods(methods) {
	      return methods || {};
	    },
	    configurePlugins: function configurePlugins(plugins, builtin) {
	      plugins = plugins || [];
	      var n, max, plugin;
	      for (n = 0, max = plugins.length; n < max; n++) {
	        plugin = plugins[n];
	        if (typeof plugin === 'function') plugins[n] = plugin = plugin();
	        if (plugin.configure) plugin.configure(this);
	      }
	      return plugins;
	    },
	    configureTransitions: function configureTransitions(transitions) {
	      var i,
	        n,
	        transition,
	        from,
	        to,
	        wildcard = this.defaults.wildcard;
	      for (n = 0; n < transitions.length; n++) {
	        transition = transitions[n];
	        from = Array.isArray(transition.from) ? transition.from : [transition.from || wildcard];
	        to = transition.to || wildcard;
	        for (i = 0; i < from.length; i++) {
	          this.mapTransition({
	            name: transition.name,
	            from: from[i],
	            to: to
	          });
	        }
	      }
	    },
	    transitionFor: function transitionFor(state, transition) {
	      var wildcard = this.defaults.wildcard;
	      return this.map[state][transition] || this.map[wildcard][transition];
	    },
	    transitionsFor: function transitionsFor(state) {
	      var wildcard = this.defaults.wildcard;
	      return Object.keys(this.map[state]).concat(Object.keys(this.map[wildcard]));
	    },
	    allStates: function allStates() {
	      return this.states;
	    },
	    allTransitions: function allTransitions() {
	      return this.transitions;
	    }
	  });

	  //-------------------------------------------------------------------------------------------------

	  config = Config;

	  //-------------------------------------------------------------------------------------------------
	  return config;
	}

	var exception;
	var hasRequiredException;
	function requireException() {
	  if (hasRequiredException) return exception;
	  hasRequiredException = 1;
	  exception = function exception(message, transition, from, to, current) {
	    this.message = message;
	    this.transition = transition;
	    this.from = from;
	    this.to = to;
	    this.current = current;
	  };
	  return exception;
	}

	var jsm;
	var hasRequiredJsm;
	function requireJsm() {
	  if (hasRequiredJsm) return jsm;
	  hasRequiredJsm = 1;
	  var mixin = requireMixin(),
	    Exception = requireException(),
	    plugin = requirePlugin(),
	    UNOBSERVED = [null, []];

	  //-------------------------------------------------------------------------------------------------

	  function JSM(context, config) {
	    this.context = context;
	    this.config = config;
	    this.state = config.init.from;
	    this.observers = [context];
	  }

	  //-------------------------------------------------------------------------------------------------

	  mixin(JSM.prototype, {
	    init: function init(args) {
	      mixin(this.context, this.config.data.apply(this.context, args));
	      plugin.hook(this, 'init');
	      if (this.config.init.active) return this.fire(this.config.init.name, []);
	    },
	    is: function is(state) {
	      return Array.isArray(state) ? state.indexOf(this.state) >= 0 : this.state === state;
	    },
	    isPending: function isPending() {
	      return this.pending;
	    },
	    can: function can(transition) {
	      return !this.isPending() && !!this.seek(transition);
	    },
	    cannot: function cannot(transition) {
	      return !this.can(transition);
	    },
	    allStates: function allStates() {
	      return this.config.allStates();
	    },
	    allTransitions: function allTransitions() {
	      return this.config.allTransitions();
	    },
	    transitions: function transitions() {
	      return this.config.transitionsFor(this.state);
	    },
	    seek: function seek(transition, args) {
	      var wildcard = this.config.defaults.wildcard,
	        entry = this.config.transitionFor(this.state, transition),
	        to = entry && entry.to;
	      if (typeof to === 'function') return to.apply(this.context, args);else if (to === wildcard) return this.state;else return to;
	    },
	    fire: function fire(transition, args) {
	      return this.transit(transition, this.state, this.seek(transition, args), args);
	    },
	    transit: function transit(transition, from, to, args) {
	      var lifecycle = this.config.lifecycle,
	        changed = this.config.options.observeUnchangedState || from !== to;
	      if (!to) return this.context.onInvalidTransition(transition, from, to);
	      if (this.isPending()) return this.context.onPendingTransition(transition, from, to);
	      this.config.addState(to); // might need to add this state if it's unknown (e.g. conditional transition or goto)

	      this.beginTransit();
	      args.unshift({
	        // this context will be passed to each lifecycle event observer
	        transition: transition,
	        from: from,
	        to: to,
	        fsm: this.context
	      });
	      return this.observeEvents([this.observersForEvent(lifecycle.onBefore.transition), this.observersForEvent(lifecycle.onBefore[transition]), changed ? this.observersForEvent(lifecycle.onLeave.state) : UNOBSERVED, changed ? this.observersForEvent(lifecycle.onLeave[from]) : UNOBSERVED, this.observersForEvent(lifecycle.on.transition), changed ? ['doTransit', [this]] : UNOBSERVED, changed ? this.observersForEvent(lifecycle.onEnter.state) : UNOBSERVED, changed ? this.observersForEvent(lifecycle.onEnter[to]) : UNOBSERVED, changed ? this.observersForEvent(lifecycle.on[to]) : UNOBSERVED, this.observersForEvent(lifecycle.onAfter.transition), this.observersForEvent(lifecycle.onAfter[transition]), this.observersForEvent(lifecycle.on[transition])], args);
	    },
	    beginTransit: function beginTransit() {
	      this.pending = true;
	    },
	    endTransit: function endTransit(result) {
	      this.pending = false;
	      return result;
	    },
	    failTransit: function failTransit(result) {
	      this.pending = false;
	      throw result;
	    },
	    doTransit: function doTransit(lifecycle) {
	      this.state = lifecycle.to;
	    },
	    observe: function observe(args) {
	      if (args.length === 2) {
	        var observer = {};
	        observer[args[0]] = args[1];
	        this.observers.push(observer);
	      } else {
	        this.observers.push(args[0]);
	      }
	    },
	    observersForEvent: function observersForEvent(event) {
	      // TODO: this could be cached
	      var n = 0,
	        max = this.observers.length,
	        observer,
	        result = [];
	      for (; n < max; n++) {
	        observer = this.observers[n];
	        if (observer[event]) result.push(observer);
	      }
	      return [event, result, true];
	    },
	    observeEvents: function observeEvents(events, args, previousEvent, previousResult) {
	      if (events.length === 0) {
	        return this.endTransit(previousResult === undefined ? true : previousResult);
	      }
	      var event = events[0][0],
	        observers = events[0][1],
	        pluggable = events[0][2];
	      args[0].event = event;
	      if (event && pluggable && event !== previousEvent) plugin.hook(this, 'lifecycle', args);
	      if (observers.length === 0) {
	        events.shift();
	        return this.observeEvents(events, args, event, previousResult);
	      } else {
	        var observer = observers.shift(),
	          result = observer[event].apply(observer, args);
	        if (result && typeof result.then === 'function') {
	          return result.then(this.observeEvents.bind(this, events, args, event))["catch"](this.failTransit.bind(this));
	        } else if (result === false) {
	          return this.endTransit(false);
	        } else {
	          return this.observeEvents(events, args, event, result);
	        }
	      }
	    },
	    onInvalidTransition: function onInvalidTransition(transition, from, to) {
	      throw new Exception("transition is invalid in current state", transition, from, to, this.state);
	    },
	    onPendingTransition: function onPendingTransition(transition, from, to) {
	      throw new Exception("transition is invalid while previous transition is still in progress", transition, from, to, this.state);
	    }
	  });

	  //-------------------------------------------------------------------------------------------------

	  jsm = JSM;

	  //-------------------------------------------------------------------------------------------------
	  return jsm;
	}

	var app;
	var hasRequiredApp;
	function requireApp() {
	  if (hasRequiredApp) return app;
	  hasRequiredApp = 1;

	  //-----------------------------------------------------------------------------------------------

	  var mixin = requireMixin(),
	    camelize = requireCamelize(),
	    plugin = requirePlugin(),
	    Config = requireConfig(),
	    JSM = requireJsm();

	  //-----------------------------------------------------------------------------------------------

	  var PublicMethods = {
	    is: function is(state) {
	      return this._fsm.is(state);
	    },
	    can: function can(transition) {
	      return this._fsm.can(transition);
	    },
	    cannot: function cannot(transition) {
	      return this._fsm.cannot(transition);
	    },
	    observe: function observe() {
	      return this._fsm.observe(arguments);
	    },
	    transitions: function transitions() {
	      return this._fsm.transitions();
	    },
	    allTransitions: function allTransitions() {
	      return this._fsm.allTransitions();
	    },
	    allStates: function allStates() {
	      return this._fsm.allStates();
	    },
	    onInvalidTransition: function onInvalidTransition(t, from, to) {
	      return this._fsm.onInvalidTransition(t, from, to);
	    },
	    onPendingTransition: function onPendingTransition(t, from, to) {
	      return this._fsm.onPendingTransition(t, from, to);
	    }
	  };
	  var PublicProperties = {
	    state: {
	      configurable: false,
	      enumerable: true,
	      get: function get() {
	        return this._fsm.state;
	      },
	      set: function set(state) {
	        throw Error('use transitions to change state');
	      }
	    }
	  };

	  //-----------------------------------------------------------------------------------------------

	  function StateMachine(options) {
	    return apply({}, options);
	  }
	  function factory() {
	    var cstor, options;
	    if (typeof arguments[0] === 'function') {
	      cstor = arguments[0];
	      options = arguments[1] || {};
	    } else {
	      cstor = function cstor() {
	        this._fsm.apply(this, arguments);
	      };
	      options = arguments[0] || {};
	    }
	    var config = new Config(options, StateMachine);
	    build(cstor.prototype, config);
	    cstor.prototype._fsm.config = config; // convenience access to shared config without needing an instance
	    return cstor;
	  }

	  //-------------------------------------------------------------------------------------------------

	  function apply(instance, options) {
	    var config = new Config(options, StateMachine);
	    build(instance, config);
	    instance._fsm();
	    return instance;
	  }
	  function build(target, config) {
	    if (_typeof(target) !== 'object' || Array.isArray(target)) throw Error('StateMachine can only be applied to objects');
	    plugin.build(target, config);
	    Object.defineProperties(target, PublicProperties);
	    mixin(target, PublicMethods);
	    mixin(target, config.methods);
	    config.allTransitions().forEach(function (transition) {
	      target[camelize(transition)] = function () {
	        return this._fsm.fire(transition, [].slice.call(arguments));
	      };
	    });
	    target._fsm = function () {
	      this._fsm = new JSM(this, config);
	      this._fsm.init(arguments);
	    };
	  }

	  //-----------------------------------------------------------------------------------------------

	  StateMachine.version = '3.0.1';
	  StateMachine.factory = factory;
	  StateMachine.apply = apply;
	  StateMachine.defaults = {
	    wildcard: '*',
	    init: {
	      name: 'init',
	      from: 'none'
	    }
	  };

	  //===============================================================================================

	  app = StateMachine;
	  return app;
	}

	var appExports = requireApp();
	var StateMachine = /*@__PURE__*/getDefaultExportFromCjs(appExports);

	console.show();
	var menu_key = {
	    "首页": "home",
	    "去赚钱": "earn",
	    "我": "self",
	    "朋友": "friend",
	};
	var machine = {
	    init: 'unlaunch',
	    transitions: [
	        { name: 'launch', from: 'unlaunch', to: 'launched' },
	        { name: 'clickHome', from: ['launched', 'friend', 'earn', 'self'], to: 'home' },
	        { name: 'clickFriend', from: ['launched', 'home', 'earn', 'self'], to: 'friend' },
	        { name: 'clickEarn', from: ['launched', 'home', 'friend', 'self'], to: 'earnLoading' },
	        { name: 'clickSelf', from: ['launched', 'home', 'friend', 'earn'], to: 'self' },
	        { name: 'loadedEarn', from: ['earnLoading', 'earn'], to: 'earn' },
	        { name: 'findAd', from: 'earn', to: 'adFinding' },
	        { name: 'findedAd', from: 'adFinding', to: 'earn' },
	        { name: 'findedAdTaskFail', from: 'adFinding', to: 'earn' },
	        { name: 'clickAdTask', from: 'earn', to: 'adTaskClicked' },
	        { name: 'matchAdType', from: 'adTaskClicked', to: 'adTypeCheck' },
	        { name: 'matchAdType', from: 'adTypeCheck', to: 'adTypeCheck' },
	        { name: 'playAd', from: ['adTypeCheck', 'adAgin'], to: 'adPlaying' },
	        { name: 'adOk', from: ['adPlaying', 'matchNextType'], to: 'adComplete' },
	        {
	            name: 'matchComplete',
	            from: ['adComplete', 'liveComplete', 'matchNextType', 'liveFollow'],
	            to: 'matchNextType'
	        },
	        { name: 'backEarn', from: 'matchNextType', to: 'earn' },
	        { name: 'aginAd', from: 'matchNextType', to: 'adAgin' },
          { name: 'taskAd', from: 'matchNextType', to: 'adTask' },
	        { name: 'playLive', from: ['adTypeCheck', 'liveAgin'], to: 'livePlaying' },
	        { name: 'liveOk', from: 'livePlaying', to: 'liveComplete' },
	        { name: 'aginLive', from: 'matchNextType', to: 'liveAgin' },
	        { name: 'followLive', from: 'matchNextType', to: 'liveFollow' },
	        {
	            name: 'goto', from: '*', to: function (s) {
	                return s;
	            }
	        }
	    ],
	    methods: {
	        onBeforeLaunch: beforeLaunch,
	        onLaunched: launchedFn,
	        onClickEarn: clickEarnFn,
	        onEarnLoading: earnLoadingFn,
	        onLoadedEarn: loadedEarnFn,
	        onAdFinding: adFindingFn,
	        onFindedAd: findedAdFn,
	        onAdTaskClicked: adTaskClickedFn,
	        onMatchAdType: adTypeCheckFn,
	        onAdPlaying: adPlayingFn,
	        onLivePlaying: livePlayingFn,
	        onAdComplete: adCompleteFn,
	        onAdAgin: adAginFn,
	        onBackEarn: backEarnFn,
	        onMatchComplete: matchCompleteFn,
	        onLiveComplete: liveOkFn,
	        onLiveAgin: liveAginFn,
	        onLiveFollow: liveFollowFn
	    }
	};
	var FSM = StateMachine.factory(machine);
	var fsm = new FSM();
	// console.log(visualize(fsm, { orientation: 'horizontal' }))
	function beforeLaunch() {
	    return launch("com.kuaishou.nebula");
	}
	function launchedFn() {
	    setTimeout(function () {
	        var menu = readCurrentMenu();
	        if (menu) {
	            fsm.goto(menu);
	            console.log("\u5F53\u524D\u83DC\u5355: ".concat(menu));
	            setTimeout(function () {
	                if (menu !== "earn") {
	                    fsm.clickEarn();
	                }
	                else {
	                    fsm.loadedEarn();
	                }
	            }, 500);
	        }
	        else {
	            launchedFn();
	        }
	    }, 500);
	}
	function clickEarnFn() {
	    switchMenuByName("去赚钱");
	}
	function earnLoadingFn() {
	    setTimeout(function () {
	        console.log("加载任务中心...");
	        if (className("android.view.View").text("任务中心").exists()) {
	            fsm.loadedEarn();
	        }
	        else {
	            earnLoadingFn();
	        }
	    }, 500);
	}
	function loadedEarnFn() {
	    // showDailyTask()
	    setTimeout(function () {
	        fsm.findAd();
	    }, 500);
	}
	function adFindingFn() {
	    setTimeout(function () {
	        console.log("查找广告...");
	        var task = selectDailyTask("看广告");
	        if (task) {
	            if (task.visibleToUser()) {
	                fsm.findedAd();
	            }
	            else {
	                scoll();
	                adFindingFn();
	            }
	        }
	        else {
	            console.log("未找到看广告任务");
	            fsm.findedAdTaskFail();
	        }
	    }, 1000);
	}
	function findedAdFn() {
	    setTimeout(function () {
	        fsm.clickAdTask();
	    }, 500);
	}
	function adTaskClickedFn() {
	    var task = selectDailyTask("看广告");
	    if (task) {
	        console.log("点击看广告");
	        task.lastChild().clickBounds();
	        setTimeout(function () {
	            fsm.matchAdType();
	        }, 500);
	    }
	    else {
	        setTimeout(function () {
	            console.log("未找到看广告任务");
	            fsm.backEarn();
	        }, 500);
	    }
	}
	function adPlayingFn() {
	    setTimeout(function () {
	        console.log("观看广告中...");
	        if (!id("video_countdown").exists()) {
	            adPlayingFn();
	            return;
	        }
	        if (!id("video_countdown").findOnce().text().includes("已成功领取")) {
	            adPlayingFn();
	            return;
	        }
	        fsm.adOk();
	    }, 1000);
	}
	function livePlayingFn() {
	    setTimeout(function () {
	        console.log("观看直播中...");
	        pickup(id("neo_count_down_text"), 'text', function (o) {
	            if (o === '已领取') {
	                fsm.liveOk();
	            }
	            else {
	                livePlayingFn();
	            }
	        });
	    }, 1000);
	}
	function liveOkFn() {
	    setTimeout(function () {
	        pickup(id("live_audience_clearable_close_container"), function (o) {
	            if (o !== null) {
	                press(o.centerX(), o.centerY(), 50);
	                fsm.matchComplete();
	            }
	            else {
	                console.log("未找到领取奖励按钮");
	            }
	        });
	    }, 500);
	}
	function adCompleteFn() {
	    setTimeout(function () {
	        if (!id("video_countdown").exists()) {
	            adCompleteFn();
	            return;
	        }
	        pickup(id("video_countdown"), 'p', function (o) {
	            if (o !== null) {
	                press(o.centerX(), o.centerY(), 50);
	                fsm.matchComplete();
	            }
	            else {
	                console.log("未找到领取奖励按钮");
	            }
	        });
	    }, 500);
	}
	function matchCompleteFn() {
	    setTimeout(function () {
	        if (className("android.view.View").text("任务中心").exists()) {
	            fsm.backEarn();
	        }
	        else if (id("again_medium_icon_dialog_ensure_text").exists()) {
	            fsm.aginAd();
	        }
	        else if (id("close_dialog_ensure_button").exists()) {
             fsm.taskAd()
          }
	        else if (id("again_dialog_ensure_text").exists()) {
	            fsm.aginLive();
	        }
	        else if (id("video_countdown").exists()) {
	            fsm.adOk();
	        }
	        else if (className("android.widget.TextView").text("退出直播间").exists()) {
	            fsm.followLive();
	        }
	        else {
	            console.log("未匹配类型，重新匹配中...");
	            fsm.matchComplete();
	        }
	    }, 500);
	}
	function adTypeCheckFn() {
	    setTimeout(function () {
	        if (id("video_countdown").exists()) {
	            fsm.playAd();
	        }
	        else if (id("live_follow_text").exists()) {
	            fsm.playLive();
	        }
	        else {
	            console.log("广告任务类型,匹配中...");
	            fsm.matchAdType();
	        }
	    }, 1000);
	}
	function adAginFn() {
	    console.log("再次观看广告");
	    pickup(id("again_medium_icon_dialog_ensure_text"), function (o) {
	        if (o !== null) {
	            press(o.centerX(), o.centerY(), 10);
	            setTimeout(function () {
	                fsm.playAd();
	            }, 500);
	        }
	        else {
	            console.log("未找到再次观看按钮");
	        }
	    });
	}
	function liveFollowFn() {
	    pickup(className("android.widget.TextView").text("退出直播间"), function (o) {
	        if (o !== null) {
	            press(o.centerX(), o.centerY(), 10);
	            setTimeout(function () {
	                fsm.matchComplete();
	            }, 500);
	        }
	        else {
	            console.log("未找到退出直播间按钮");
	        }
	    });
	}
	function liveAginFn() {
	    pickup(id("again_dialog_ensure_text"), function (o) {
	        if (o !== null) {
	            press(o.centerX(), o.centerY(), 10);
	            setTimeout(function () {
	                fsm.playLive();
	            }, 500);
	        }
	        else {
	            console.log("未找到再次观看按钮");
	        }
	    });
	}
	function backEarnFn() {
	    setTimeout(function () {
	        fsm.clickAdTask();
	    }, 500);
	}
	// zhuanqian_action()
	function scoll() {
	    swipe(device.width * 0.5, device.height * 0.8, device.width * 0.5, device.height * 0.2, 500);
	}
	function selectDailyTask(name) {
	    var tasks = pickup(className("android.view.View").text("日常任务"), 'p2').children();
	    for (var i = 0; i < tasks.size(); i++) {
	        var w = tasks.get(i);
	        if (selectTask(w, name)) {
	            return w;
	        }
	    }
	}
	function selectTask(w, name) {
	    if (w.id()) {
	        var a = pickup(w, className("android.widget.TextView"));
	        if (a.text().includes(name)) {
	            return true;
	        }
	    }
	}
	// console.log(task_center.exists() ? "找到任务中心" : "未找到任务中心")
	// buttom.clickBounds()
	function readCurrentMenu() {
	    if (className("androidx.appcompat.app.ActionBar$c").exists()) {
	        var menus = className("androidx.appcompat.app.ActionBar$c").find();
	        for (var _i = 0, menus_1 = menus; _i < menus_1.length; _i++) {
	            var w = menus_1[_i];
	            if (w.selected()) {
	                return menu_key[w.desc()];
	            }
	        }
	    }
	    return false;
	}
	function switchMenuByName(name) {
	    var menus = className("androidx.appcompat.app.ActionBar$c").untilFind();
	    for (var _i = 0, menus_2 = menus; _i < menus_2.length; _i++) {
	        var w = menus_2[_i];
	        if (w.desc() === name) {
	            console.log("\u70B9\u51FB ".concat(w.desc()));
	            w.clickBounds();
	        }
	    }
	}
	fsm.launch();
	//

})();

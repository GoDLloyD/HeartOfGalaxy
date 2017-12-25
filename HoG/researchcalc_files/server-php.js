;(function(window, document, undefined){
    
    /* settings ------------------------------------------------------------ */
    var ASSET_DIR = 'https://ad.xdomain.ne.jp/img/';
    var BANNER_LIST_FOR_ANDROID = [
        {
            img: ASSET_DIR + 'xrebirth.gif',
            url: 'https://ad.xdomain.ne.jp/rd.php?aid=xdomain_xrebirth_a'
        }
    ];
    var BANNER_LIST_FOR_OTHER = [
        {
            img: ASSET_DIR + 'xrebirth.gif',
            url: 'https://ad.xdomain.ne.jp/rd.php?aid=xdomain_xrebirth_i'
        }
    ];
    /* --------------------------------------------------------------------- */


    if (!Function.prototype.bind) {
        Function.prototype.bind = function(oThis) {
            if (typeof this !== 'function') {
                throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
            }

            var aArgs = Array.prototype.slice.call(arguments, 1);
            var fToBind = this;
            var fNOP = function() {};
            var fBound = function() {
                return fToBind.apply(this instanceof fNOP && oThis ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
            };

            fNOP.prototype = this.prototype;
            fBound.prototype = new fNOP();

            return fBound;
        };
    }

    if (!Array.prototype.forEach) {
        Array.prototype.forEach = function(callback, thisArg) {
            var T, k;

            if (this == null) {
                throw new TypeError(" this is null or not defined");
            }

            var O = Object(this);
            var len = O.length >>> 0;

            if ({}.toString.call(callback) != "[object Function]") {
                throw new TypeError(callback + " is not a function");
            }

            if (thisArg) {
                T = thisArg;
            }

            k = 0;
            while (k < len) {
                var kValue;
                if (k in O) {
                    kValue = O[k];
                    callback.call(T, kValue, k, O);
                }
                k++;
            }
        };
    }

    var ua = window.navigator.userAgent.toLowerCase();
    var classToType = {};
    'Boolean Number String Function Array Date RegExp Object Error Symbol'.split(' ').forEach(function(name) {
        classToType['[object ' + name + ']'] = name.toLowerCase();
    });

    var utils = {
        isTarget: !!ua.match(/ip(hone|od|ad)/i)
        || !!ua.match(/android/i)
        || (!!ua.match(/firefox/i) && !!ua.match(/mobile/i))
        || (!!ua.match(/windows/i) && (!!ua.match(/phone/i) || !!ua.match(/touch/i)))
        || !!ua.match(/blackberry/i)
        || !!ua.match(/kindle/i)
        || !!ua.match(/silk/i)
        || !!ua.match(/playbook/i),

        isAndroid: !!ua.match(/android/i),

        iosVersion: (function() {
            var v, versions;
            if (/iP(hone|od|ad)/.test(navigator.platform)) {
                v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
                versions = [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3] || 0, 10)];
                return versions[0];
            }
            return versions;
        })(),

        androidVersion: (function() {
            if (!!ua.match(/android/i)) {
                var version;
                if (!!ua.match(/firefox/i)) {
                    version = parseFloat(navigator.appVersion);
                } else {
                    version = parseFloat(ua.slice(ua.indexOf('android') + 8));
                }
                if (version !== version) {
                    version = 4;
                }
                return version;
            }
        })(),

        type: function(obj) {
            if (obj == null) {
                return obj + '';
            }
            return typeof obj === 'object' || typeof obj === 'function' ?
            classToType[toString.call(obj)] || 'object' :
            typeof obj;
        },

        debounce: function(func, wait, immediate) {
            immediate = immediate === undefined ? false : immediate;
            var timeout;
            return function() {
                var context = this, args = arguments;
                var later = function() {
                    timeout = null;
                    if (!immediate) func.apply(context, args);
                };
                var callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) func.apply(context, args);
            };
        },

        copy: function(array) {
            var newArray = [];
            var i = 0;
            try {
                newArray = [].slice.call(array);
            } catch (e) {
                for (; i < array.length; i++) {
                    newArray.push(array[i]);
                }
            }
            return newArray;
        }
    };


    var EventDispatcher = function() {
        this._events = {};
    };

    EventDispatcher.prototype.hasEventListener = function(eventType, handler) {
        if (this._events[eventType] === undefined) {
            return false;
        } else {
            var events = this._events[eventType];
            var i = events.length;
            for (; i--;) {
                if (events[i] === handler) {
                    return true;
                }
            }
        }
    };

    EventDispatcher.prototype.addEventListener = function(eventType, handler) {
        if (this._events[eventType] !== undefined) {
            var events = this._events[eventType];
            var length = events.length;
            var i = 0;
            for (; i < length; i++) {
                if (events[i] === handler) {
                    return;
                }
            }
            events.push(handler);
        } else {
            this._events[eventType] = [handler];
        }
    };

    EventDispatcher.prototype.removeEventListener = function(eventType, handler) {
        if (this.hasEventListener(eventType, handler)) {
            var events = this._events[eventType];
            var i = events.length;
            var index;
            while (i--) {
                if (events[i] === handler) {
                    index = i;
                }
            }
            events.splice(index, 1);
        }
    };

    EventDispatcher.prototype.dispatchEvent = function(eventType, context, extra) {
        if (this._events[eventType] !== undefined) {
            var events = this._events[eventType];
            var copyEvents = utils.copy(events);
            var obj = {
                type: eventType,
                target: context,
                extra: extra
            };
            var length = events.length;
            var i = 0;

            for (; i < length; i++) {
                copyEvents[i].call(context || this, obj);
            }
        }
    };


    var Orientation = function() {
        EventDispatcher.call(this);

        this.portrait = null;
        this.checkOrientation = this.checkOrientation.bind(this);

        window.addEventListener(Orientation.eventType, this.checkOrientation, false);
        this.checkOrientation();
    };
    Orientation.orig = Orientation.prototype.constructor;
    Orientation.prototype = new EventDispatcher();
    Orientation.prototype.constructor = Orientation.orig;

    Orientation.ORIENTATION_CHANGE = 'orientation_orientation_change';
    Orientation.eventType = 'onorientationchange' in window ? 'orientationchange' : 'resize';

    Orientation.prototype.isPortrait = (function() {
        var func;
        if (!'onorientationchange' in window) {
            func = function() {
                var w = parseInt(window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth, 10);
                var h = parseInt(window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight, 10);
                return h > w;
            };
        } else {
            if ('orientation' in window) {
                func = function() {
                    return Math.abs(window.orientation) !== 90;
                };
            } else if (window.matchMedia !== undefined) {
                func = function() {
                    return window.matchMedia('(orientation: portrait)').matches;
                };
            }
        }
        return func;
    })();

    Orientation.prototype.checkOrientation = function() {
        var that = this;
        setTimeout(function() {
            var o = that.isPortrait();
            if (o === that.portrait) {
                return;
            }
            that.portrait = o;
            that.dispatchEvent(Orientation.ORIENTATION_CHANGE, that, o);
        }, 25);
    };

    Orientation.prototype.destroy = function() {
        window.removeEventListener(Orientation.eventType, this.checkOrientation);
        for (var key in this) {
            if (this.hasOwnProperty(key)) {
                this[key] = null;
            }
        }
    };

    var BannerLegacy = function(data, isPortrait) {
        EventDispatcher.call(this);

        this.data = data;
        this.isPortrait = isPortrait;
        this.isAnimated = false;

        this.scrollTarget = null;
        if (navigator.userAgent.indexOf('WebKit') < 0) {
            this.scrollTarget = document.documentElement;
        } else {
            this.scrollTarget = document.body;
        }

        this.touchEndEventName = 'touchend';
        var ua = window.navigator.userAgent.toLowerCase();
        var winTouch = !!ua.match(/windows/i) && !!ua.match(/touch/i);
        if (5 > utils.androidVersion && utils.androidVersion >= 4 || winTouch) {
            this.touchEndEventName = 'click';
        }

        this.remove = this.remove.bind(this);

        var styles = BannerLegacy.styles;

        this.bnr = document.createElement('div');
        BannerLegacy.setStyle(this.bnr, styles.bnr);

        this.jump = document.createElement('a');
        this.jump.setAttribute('href', this.data.url);
        this.jump.setAttribute('target', 'blank');
        BannerLegacy.setStyle(this.jump, styles.jump);

        this.img = document.createElement('img');
        this.img.onload = this.firstSet.bind(this);
        this.img.src = this.data.img;
        BannerLegacy.setStyle(this.img, styles.img);

        this.closeBtn = document.createElement('img');
        this.closeBtn.src = BannerLegacy.ASSET_DIR + 'close.png';
        this.closeBtn.addEventListener(this.touchEndEventName, this.remove, false);
        BannerLegacy.setStyle(this.closeBtn, styles.closeBtn);
    };
    BannerLegacy.orig = BannerLegacy.prototype.constructor;
    BannerLegacy.prototype = new EventDispatcher();
    BannerLegacy.prototype.constructor = BannerLegacy.orig;

    BannerLegacy.REMOVE = 'banner_remove';
    BannerLegacy.ASSET_DIR = 'ad/';
    BannerLegacy.WIDTH = 320;
    BannerLegacy.HEIGHT = 50;
    BannerLegacy.SPACE = 20;
    BannerLegacy.styles = {
        bnr: {
            display: 'none',
            zIndex: '2147483647',
            position: 'absolute',
            top: '0',
            left: '0',
            width: BannerLegacy.WIDTH + 'px',
            height: BannerLegacy.HEIGHT + 'px',
            WebkitTransition: 'opacity 200ms ease-out',
            transition: 'opacity 200ms ease-out',
            opacity: '0',
            overflow: 'hidden',
            margin: '0',
            padding: '0',
            border: 'none'
        },

        closeBtn: {
            display: 'block',
            position: 'absolute',
            width: '7.812%',
            top: '0',
            right: '0',
            cursor: 'pointer',
            margin: '0',
            padding: '0',
            border: 'none'
        },

        jump: {
            display: 'block',
            width: '100%',
            margin: '0',
            padding: '0',
            border: 'none'
        },

        img: {
            display: 'block',
            width: '100%',
            margin: '0',
            padding: '0',
            border: 'none'
        }
    };

    BannerLegacy.setStyle = function(element, styles) {
        for (var prop in styles) {
            if (styles.hasOwnProperty(prop)) {
                element.style[prop] = styles[prop];
            }
        }
    };

    BannerLegacy.prototype.firstSet = function() {
        this.jump.appendChild(this.img);
        this.bnr.appendChild(this.jump);
        this.bnr.appendChild(this.closeBtn);

        this.setOrientation(this.isPortrait);
        this.update();
        this.show();
    };

    BannerLegacy.prototype.setOrientation = function(isPortrait) {
        this.isPortrait = isPortrait;
    };

    BannerLegacy.prototype.update = function() {
        var width;
        var height;
        var posX = 0;
        var posY = 0;
        var scrollTop = this.scrollTarget.scrollTop;
        var scrollLeft = this.scrollTarget.scrollLeft;
        var windowWidth = window.innerWidth;
        var windowHeight = window.innerHeight;
        var clientWidth = document.documentElement.clientWidth;
        var pageHeight = this.scrollTarget.scrollHeight;
        var zoom = clientWidth / windowWidth;

        width = clientWidth / zoom;

        if (this.isPortrait) {
            posX = scrollLeft;
        } else {
            posX = width * (BannerLegacy.SPACE / 100);
            width = width - (posX * 2);
            if (width < BannerLegacy.WIDTH / zoom) {
                width = BannerLegacy.WIDTH / zoom;
                posX = (windowWidth - (BannerLegacy.WIDTH / zoom)) / 2;
            }
            posX = scrollLeft + posX;
        }

        height = BannerLegacy.HEIGHT * (width / BannerLegacy.WIDTH);

        if (scrollTop + windowHeight + 100 >= pageHeight && windowHeight < pageHeight) {
            posY = scrollTop;
        } else {
            posY = scrollTop + windowHeight - height;
        }

        this.bnr.style.width = Math.ceil(width) + 'px';
        this.bnr.style.height = Math.ceil(height) + 'px';
        this.bnr.style.left = Math.ceil(posX) + 'px';
        this.bnr.style.top = Math.ceil(posY) + 'px';
    };

    BannerLegacy.prototype.show = function(duration) {
        if (this.isAnimated) return;
        this.isAnimated = true;

        duration = duration === undefined ? 100 : duration;

        document.body.appendChild(this.bnr);
        this.bnr.style.transition = 'opacity ' + duration + 'ms ease-out';
        this.bnr.style.display = 'block';

        var that = this;
        setTimeout(function() {
            that.bnr.style.opacity = '1';
            that.isAnimated = false;
        }, 50);
    };

    BannerLegacy.prototype.hide = function() {
        this.bnr.style.opacity = '0';
        this.bnr.style.display = 'none';
    };

    BannerLegacy.prototype.remove = function() {
        document.body.removeChild(this.bnr);
        this.dispatchEvent(BannerLegacy.REMOVE, this);
    };

    BannerLegacy.prototype.destroy = function() {
        this.closeBtn.removeEventListener(this.touchEndEventName, this.remove);
        for (var key in this) {
            if (this.hasOwnProperty(key)) {
                this[key] = null;
            }
        }
    };


    var AdLegacy = function(bannerList) {
        this.bannerList = bannerList;
        this.isTouch = false;
        this.isAndroid4 = 5 > utils.androidVersion && utils.androidVersion >= 4;

        this.scrollTarget = null;
        if (navigator.userAgent.indexOf('WebKit') < 0) {
            this.scrollTarget = document.documentElement;
        } else {
            this.scrollTarget = document.body;
        }

        this.scrollWatcherEnabled = false;
        this.scrollTimerId = 0;
        this.scrollCounter = 0;
        this.scrollBoundary = 500;
        this.scrollTop = this.scrollTarget.scrollTop;
        this.scrollTopOld = this.scrollTarget.scrollTop;
        this.scrollLeft = this.scrollTarget.scrollLeft;
        this.orientation = new Orientation();
        this.banner;

        this.resizeHandler = this.resizeHandler.bind(this);
        if (!this.isAndroid4) {
            this.scrollHandler = this.scrollHandler.bind(this);
            this.touchMoveHandler = this.touchMoveHandler.bind(this);
        } else {
            this.scrollHandler = this.scrollHandler_android4.bind(this);
            this.touchMoveHandler = this.touchMoveHandler_android4.bind(this);
        }
        this.touchEndHandler = this.touchEndHandler.bind(this);
        this.changeOrientationHandler = this.changeOrientationHandler.bind(this);
        this.destroy = this.destroy.bind(this);
    };

    AdLegacy.ASSET_DIR = 'ad/';

    AdLegacy.prototype.show = function() {
        var bannerData = this.bannerList[Math.floor(Math.random() * this.bannerList.length)];
        BannerLegacy.ASSET_DIR = AdLegacy.ASSET_DIR;
        this.banner = new BannerLegacy(bannerData, this.orientation.portrait);

        document.addEventListener('touchmove', this.touchMoveHandler, false);
        window.addEventListener('resize', this.resizeHandler, false);
        window.addEventListener('scroll', this.scrollHandler, false);

        this.banner.addEventListener(BannerLegacy.REMOVE, this.destroy);
        this.orientation.addEventListener(Orientation.ORIENTATION_CHANGE, this.changeOrientationHandler);
    };

    AdLegacy.prototype.update = function() {
        this.banner.update();
    };

    AdLegacy.prototype.scrollWatcherEnable = function() {
        this.scrollBoundary *= document.documentElement.clientWidth / 320;
        this.scrollTopOld = this.scrollTarget.scrollTop;
        this.scrollWatcherEnabled = true;
    };

    AdLegacy.prototype.checkScrollCounter = function(scrollTop) {
        if (!this.scrollWatcherEnabled) {
            return false;
        }
        this.scrollCounter += Math.abs(scrollTop - this.scrollTopOld);
        this.scrollTopOld = scrollTop;
        return this.scrollCounter > this.scrollBoundary;
    };

    AdLegacy.prototype.resizeHandler = utils.debounce(function() {
        if (this.isTouch) return;
        this.banner.update();
    }, 200);

    AdLegacy.prototype.scrollHandler = utils.debounce(function() {
        if (this.isTouch) return;
        this.banner.update();
    }, 200);

    AdLegacy.prototype.scrollHandler_android4 = utils.debounce(function() {
        this.banner.update();
        this.touchEndHandler();
    }, 200);

    AdLegacy.prototype.touchMoveHandler = function() {
        if (this.isTouch) return;
        this.isTouch = true;
        this.scrollTop = this.scrollTarget.scrollTop;
        this.scrollLeft = this.scrollTarget.scrollLeft;
        this.banner.hide();
        document.addEventListener('touchend', this.touchEndHandler, false);
    };

    AdLegacy.prototype.touchMoveHandler_android4 = utils.debounce(function() {
        this.banner.hide();
        this.banner.update();
        this.touchEndHandler();
    }, 200, true);

    AdLegacy.prototype.touchEndHandler = function() {
        var that = this;
        clearInterval(this.scrollTimerId);
        this.scrollTimerId = setInterval(function() {
            var scrollTop = that.scrollTarget.scrollTop;
            var scrollLeft = that.scrollTarget.scrollLeft;
            if (scrollTop === that.scrollTop && scrollLeft === that.scrollLeft) {
                clearInterval(that.scrollTimerId);
                that.isTouch = false;
                that.banner.update();
                if (that.checkScrollCounter(scrollTop)) {
                    that.banner.remove();
                } else {
                    that.banner.show();
                }
            }
            that.scrollTop = scrollTop;
            that.scrollLeft = scrollLeft;
        }, 200);

        document.removeEventListener('touchend', this.touchEndHandler);
    };

    AdLegacy.prototype.changeOrientationHandler = function(e) {
        this.banner.setOrientation(e.extra);
        this.banner.update();
    };

    AdLegacy.prototype.destroy = function() {
        window.removeEventListener('resize', this.resizeHandler);
        window.removeEventListener('scroll', this.scrollHandler);
        document.removeEventListener('touchmove', this.touchMoveHandler);
        document.removeEventListener('touchend', this.touchEndHandler);
        this.orientation.destroy();
        this.banner.destroy();
        for (var key in this) {
            if (this.hasOwnProperty(key)) {
                this[key] = null;
            }
        }
    };


    var Banner = function(data, isPortrait) {
        EventDispatcher.call(this);

        this.data = data;
        this.isPortrait = isPortrait;
        this.isAnimated = false;

        this.scrollTarget = null;
        if (navigator.userAgent.indexOf('WebKit') < 0) {
            this.scrollTarget = document.documentElement;
        } else {
            this.scrollTarget = document.body;
        }

        this.touchEndEventName = 'touchend';
        var ua = window.navigator.userAgent.toLowerCase();
        var winTouch = !!ua.match(/windows/i) && !!ua.match(/touch/i);
        if (5 > utils.androidVersion && utils.androidVersion >= 4 || winTouch) {
            this.touchEndEventName = 'click';
        }

        this.remove = this.remove.bind(this);

        var styles = Banner.styles;

        this.bnr = document.createElement('div');
        Banner.setStyle(this.bnr, styles.bnr);

        this.jump = document.createElement('a');
        this.jump.setAttribute('href', this.data.url);
        this.jump.setAttribute('target', 'blank');
        Banner.setStyle(this.jump, styles.jump);

        this.img = document.createElement('img');
        this.img.src = this.data.img;
        Banner.setStyle(this.img, styles.img);

        this.closeBtn = document.createElement('img');
        this.closeBtn.src = Banner.ASSET_DIR + 'close.png';
        this.closeBtn.addEventListener(this.touchEndEventName, this.remove, false);
        Banner.setStyle(this.closeBtn, styles.closeBtn);
    };
    Banner.orig = Banner.prototype.constructor;
    Banner.prototype = new EventDispatcher();
    Banner.prototype.constructor = Banner.orig;

    Banner.READY = 'banner_ready';
    Banner.REMOVE = 'banner_remove';
    Banner.ASSET_DIR = 'ad/';
    Banner.WIDTH = 320;
    Banner.HEIGHT = 50;
    Banner.SPACE = 20;
    Banner.styles = {
        bnr: {
            display: 'none',
            zIndex: '2147483647',
            position: 'fixed',
            bottom: '0',
            left: '0',
            width: Banner.WIDTH + 'px',
            height: Banner.HEIGHT + 'px',
            WebkitTransition: 'opacity 200ms ease-out',
            transition: 'opacity 200ms ease-out',
            opacity: '0',
            overflow: 'hidden',
            margin: '0',
            padding: '0',
            border: 'none'
        },

        closeBtn: {
            display: 'block',
            position: 'absolute',
            width: '7.812%',
            top: '0',
            right: '0',
            cursor: 'pointer',
            margin: '0',
            padding: '0',
            border: 'none'
        },

        jump: {
            display: 'block',
            width: '100%',
            margin: '0',
            padding: '0',
            border: 'none'
        },

        img: {
            display: 'block',
            width: '100%',
            margin: '0',
            padding: '0',
            border: 'none'
        }
    };

    Banner.setStyle = function(element, styles) {
        for (var prop in styles) {
            if (styles.hasOwnProperty(prop)) {
                element.style[prop] = styles[prop];
            }
        }
    };

    Banner.prototype.init = function() {
        var that = this;
        var img = new Image();
        img.onload = function() {
            that.jump.appendChild(that.img);
            that.bnr.appendChild(that.jump);
            that.bnr.appendChild(that.closeBtn);

            that.setOrientation(that.isPortrait);
            that.update();

            that.dispatchEvent(Banner.READY);
        };
        img.src = this.data.img;
    };

    Banner.prototype.setOrientation = function(isPortrait) {
        this.isPortrait = isPortrait;
    };

    Banner.prototype.update = function() {
        var width;
        var height;
        var posX = 0;
        var scrollTop = this.scrollTarget.scrollTop;
        var scrollLeft = this.scrollTarget.scrollLeft;
        var windowWidth = window.innerWidth;
        var windowHeight = window.innerHeight;
        var clientWidth = document.documentElement.clientWidth;
        var pageHeight = this.scrollTarget.scrollHeight;
        var zoom = clientWidth / windowWidth;

        if (!this.isPortrait) {
            width = clientWidth / zoom;
            posX = width * (Banner.SPACE / 100);
            width = width - (posX * 2);
            if (width < Banner.WIDTH / zoom) {
                width = Banner.WIDTH / zoom;
                posX = (windowWidth - (Banner.WIDTH / zoom)) / 2;
            }
            posX = scrollLeft + posX;
        } else {
            width = windowWidth;
        }

        height = Banner.HEIGHT * (width / Banner.WIDTH);

        if (scrollTop + windowHeight + 100 >= pageHeight && windowHeight < pageHeight) {
            this.bnr.style.bottom = 'auto';
            this.bnr.style.top = 0;
        } else {
            this.bnr.style.bottom = 0;
            this.bnr.style.top = 'auto';
        }

        this.bnr.style.width = Math.floor(width) + 'px';
        this.bnr.style.height = Math.floor(height) + 'px';
        this.bnr.style.left = Math.floor(posX) + 'px';
    };

    Banner.prototype.show = function(duration) {
        if (this.isAnimated) return;
        this.isAnimated = true;

        duration = duration === undefined ? 100 : duration;

        document.body.appendChild(this.bnr);
        this.bnr.style.transition = 'opacity ' + duration + 'ms ease-out';
        this.bnr.style.display = 'block';

        var that = this;
        setTimeout(function() {
            that.bnr.style.opacity = '1';
            that.isAnimated = false;
        }, 50);
    };

    Banner.prototype.hide = function() {
        this.bnr.style.opacity = '0';
        this.bnr.style.display = 'none';
    };

    Banner.prototype.remove = function() {
        if (this.isAnimated) return;
        this.isAnimated = true;

        var that = this;

        var transitionCompleted = false;
        var transitionEndHandler = function() {
            if (transitionCompleted) return;
            transitionCompleted = true;
            that.isAnimated = false;
            document.body.removeChild(that.bnr);
            that.bnr.removeEventListener('webkitTransitionEnd', transitionEndHandler);
            that.bnr.removeEventListener('transitionend', transitionEndHandler);
            that.dispatchEvent(Banner.REMOVE, that);
        };

        this.bnr.addEventListener('webkitTransitionEnd', transitionEndHandler);
        this.bnr.addEventListener('transitionend', transitionEndHandler);

        this.bnr.style.transition = 'opacity 300ms ease-out';
        this.bnr.style.display = 'block';

        setTimeout(function() {
            that.bnr.style.opacity = '0';
        }, 50);
    };

    Banner.prototype.destroy = function() {
        this.closeBtn.removeEventListener(this.touchEndEventName, this.remove);
        for (var key in this) {
            if (this.hasOwnProperty(key)) {
                this[key] = null;
            }
        }
    };


    var Ad = function(bannerList) {
        this.bannerList = bannerList;

        this.scrollTarget = null;
        if (navigator.userAgent.indexOf('WebKit') < 0) {
            this.scrollTarget = document.documentElement;
        } else {
            this.scrollTarget = document.body;
        }

        this.scrollCounter = 0;
        this.scrollBoundary = 500;
        this.scrollTop = this.scrollTarget.scrollTop;
        this.zoomTimerId = 0;
        this.orientation = new Orientation();
        this.banner;

        this.scrollHandler = this.scrollHandler.bind(this);
        this.scrollWatch = this.scrollWatch.bind(this);
        this.changeOrientationHandler = this.changeOrientationHandler.bind(this);
        this.destroy = this.destroy.bind(this);
    };

    Ad.ASSET_DIR = 'ad/';

    Ad.prototype.show = function() {
        var that = this;

        var bannerData = this.bannerList[Math.floor(Math.random() * this.bannerList.length)];
        Banner.ASSET_DIR = Ad.ASSET_DIR;

        this.banner = new Banner(bannerData, this.orientation.portrait);
        this.banner.addEventListener(Banner.READY, function() {
            that.banner.show();
        });
        this.banner.addEventListener(Banner.REMOVE, this.destroy);
        this.banner.init();

        this.orientation.addEventListener(Orientation.ORIENTATION_CHANGE, this.changeOrientationHandler);

        window.addEventListener('scroll', this.scrollHandler, false);

        var zoom;
        this.zoomTimerId = setInterval(function() {
            zoom = document.documentElement.clientWidth / window.innerWidth;
            if (zoom < 1.1) {
                that.banner.show();
            } else {
                that.banner.hide();
            }
        }, 1000);
    };

    Ad.prototype.update = function() {
        this.banner.update();
    };

    Ad.prototype.scrollWatcherEnable = function() {
        this.scrollBoundary *= document.documentElement.clientWidth / 320;
        this.scrollTop = this.scrollTarget.scrollTop;
        window.addEventListener('scroll', this.scrollWatch, false);
    };

    Ad.prototype.scrollHandler = utils.debounce(function() {
        this.banner.update();
    }, 200);

    Ad.prototype.scrollWatch = function() {
        var scrollTop = this.scrollTarget.scrollTop;
        scrollTop = scrollTop < 0 ? 0 : scrollTop;
        this.scrollCounter += Math.abs(scrollTop - this.scrollTop);
        this.scrollTop = scrollTop;
        if (this.scrollCounter > this.scrollBoundary) {
            window.removeEventListener('scroll', this.scrollHandler);
            this.banner.remove();
        }
    };

    Ad.prototype.changeOrientationHandler = function(e) {
        this.banner.setOrientation(e.extra);
        this.banner.update();
    };

    Ad.prototype.destroy = function() {
        window.removeEventListener('scroll', this.scrollHandler);
        window.removeEventListener('scroll', this.scrollWatch);
        clearInterval(this.zoomTimerId);
        this.orientation.destroy();
        this.banner.destroy();
        for (var key in this) {
            if (this.hasOwnProperty(key)) {
                this[key] = null;
            }
        }
    };


    (function() {
        if (!utils.isTarget) {
            return;
        }

        var ad;

        var domContentLoadedHandler = function() {
            var url = window.location.href;
            var className = document.body.className;
            var isWPAdmin = !!url.match(/\/wp-admin/i)
            || !!url.match(/\/wp-login/i)
            || !!className.match(/wp-admin/i)
            || !!className.match(/login/i) && !!className.match(/wp-core-ui/i);
            if (isWPAdmin) {
                return;
            }

            var bannerList = utils.isAndroid ? BANNER_LIST_FOR_ANDROID : BANNER_LIST_FOR_OTHER;

            if (utils.iosVersion >= 5 || utils.androidVersion >= 4) {
                Ad.ASSET_DIR = ASSET_DIR;
                ad = new Ad(bannerList);
            } else {
                AdLegacy.ASSET_DIR = ASSET_DIR;
                ad = new AdLegacy(bannerList);
            }

            ad.show();
        };

        var windowOnloadHandler = function() {
            ad.update();

            setTimeout(function() {
                ad.scrollWatcherEnable();
            }, 1000);
        };

        document.addEventListener('DOMContentLoaded', domContentLoadedHandler);
        window.addEventListener('load', windowOnloadHandler, false);
    })();

})(window, document);
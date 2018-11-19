define([
  'core/js/adapt',
  './buttonView',
  'libraries/hammer.min'
], function(Adapt, ButtonView) {

    var ScrollSnap = Backbone.Controller.extend({

        _config: null,
        _buttonView: null,
        _locationId: null,
        _blockModels: [],
        _currentModel: null,
        _blockViews: [],
        _isInternalNavigation: null,
        _hammer: null,
        _isShiftKeyPressed: false,

        initialize: function() {
            this.listenToOnce(Adapt, 'adapt:start', this.onAdaptStart);
        },

        _disableTabindexes: function() {
            // prevent default tabbing as this interferes with scrolling
            $('a, button, [tabindex]').attr('tabindex', '-1');
        },

        enable: function() {
            this.addScrollEvents();

            if (this._buttonView && !this.getIsLastModelIndex(this.getCurrentModelIndex())) {
                this._buttonView.show();
            }
        },

        disable: function() {
            this.removeScrollEvents();

            if (this._buttonView) this._buttonView.hide();
        },

        addHtmlClass: function() {
            var $html = $('html');

            $html.addClass('scrollSnap');
            if (this._config._useNavigationOffset === false) $html.addClass('no-navigation-offset');
        },

        addScrollEvents: function() {
            if (Adapt.device.screenSize === "large") {
                this._onWheel = _.bind(this.onWheel, this);
                this._onKeyDown = _.bind(this.onKeyDown, this);
                this._onKeyUp = _.bind(this.onKeyUp, this);
                this._onSwipeUp = _.bind(this.onSwipeUp, this);
                this._onSwipeDown = _.bind(this.onSwipeDown, this);

                window.addEventListener('touchmove', this.onTouchMove);
                window.addEventListener('wheel', this._onWheel);
                window.addEventListener('keydown', this._onKeyDown);
                window.addEventListener('keyup', this._onKeyUp);

                this._hammer = new Hammer(document.getElementById('wrapper'));
                this._hammer.get('swipe').set({ direction: Hammer.DIRECTION_ALL });
                this._hammer.on('swipeup', this._onSwipeUp);
                this._hammer.on('swipedown', this._onSwipeDown);
            } else {
                this._onScroll = _.debounce(_.bind(this.onScroll, this), 1000);

                window.addEventListener('scroll', this._onScroll);
            }
        },

        removeScrollEvents: function() {
            window.removeEventListener('touchmove', this.onTouchMove);
            window.removeEventListener('scroll', this._onScroll);
            window.removeEventListener('wheel', this._onWheel);
            window.removeEventListener('keydown', this._onKeyDown);
            window.removeEventListener('keyup', this._onKeyUp);

            if (this._hammer) this._hammer.destroy();
        },

        initButton: function() {
            var config = this._config._button;

            if (config && config._isEnabled) {
                var model = new Backbone.Model(config);
                this._buttonView = new ButtonView({ model: model });

                this.listenTo(this._buttonView, 'buttonClick', this.onButtonClick);
            }
        },

        getCurrentModelIndex: function() {
            return this._blockModels.indexOf(this._currentModel);
        },

        setCurrentModel: function(model) {
            if (!model) return;

            this._currentModel = model;
            this._locationId = model.get('_id');
        },

        getIsFirstModelIndex: function(index) {
            return index === 0;
        },

        getIsLastModelIndex: function(index) {
            return index === (this._blockModels.length - 1);
        },

        scrollToId: function(id, duration) {
            this.disable();

            this._isInternalNavigation = true;

            var settings = {
                duration: (duration !== undefined) ? duration : this._config._scrollDuration || 400
            };

            if (Adapt.device.screenSize === "large") {
                var offsetTop = (this._config._useNavigationOffset) ? -$(".navigation").outerHeight() / 2 : 0;
                settings.offset = { top: offsetTop };
            }

            Adapt.scrollTo('.' + id, settings);
        },

        setLocationId: function() {
            var highestOnscreen = 0;
            var highestId;

            for (var i = 0, l = this._blockViews.length; i < l; i++) {
                var view = this._blockViews[i];
                var id = view.model.get('_id');
                var selector = '.' + id;
                var element = $(selector);
                var measurements = element.onscreen();

                if (!measurements.onscreen) continue;
                if (measurements.percentInview > highestOnscreen) {
                    highestOnscreen = measurements.percentInview;
                    highestId = id;
                }
            }

            var model = this._blockModels.filter(function(model) {
                return model.get('_id') === highestId;
            })[0];

            this.setCurrentModel(model);
        },

        snapUp: function() {
            var index = this.getCurrentModelIndex();

            if (this.getIsFirstModelIndex(index)) return;

            this.setCurrentModel(this._blockModels[index - 1]);

            this.scrollToId(this._locationId);
        },

        snapDown: function() {
            var index = this.getCurrentModelIndex();

            if (this.getIsLastModelIndex(index)) return;

            this.setCurrentModel(this._blockModels[index + 1]);

            this.scrollToId(this._locationId);
        },

        onAdaptStart: function() {
            this._config = Adapt.course.get('_scrollSnap');

            if (this._config && this._config._isEnabled) {
                this.addHtmlClass();

                this.listenTo(Adapt, {
                    'pageView:preRender': this.onPagePreRender,
                    'pageView:ready': this.onPageReady,
                    'page:scrolledTo': this.onPageScrolledTo,
                    'router:location': this.onRouterLocation
                });
            }
        },

        onPagePreRender: function(view) {
            this._blockModels = view.model.findDescendantModels('blocks');

            var locationId = Adapt.location._currentId;
            var model = Adapt.findById(locationId);

            if (model.get('_type') !== "block") model = this._blockModels[0];

            this.setCurrentModel(model);

            this.listenTo(Adapt, 'blockView:postRender', this.onBlockPostRender);
        },

        onPageReady: function(view) {
            this._disableTabindexes();
            this.initButton();

            window.addEventListener('resize', _.bind(this.onWindowResize, this));

            this.addScrollEvents();

            this.scrollToId(this._locationId, 0);
        },

        onBlockPostRender: function (view) {
            this._blockViews.push(view);
        },

        onPageScrolledTo: function() {
            if (this._isInternalNavigation) {
                this._isInternalNavigation = false;
                this.enable();
            } else {
                this.setLocationId();
                this.setCurrentModel(Adapt.findById(this._locationId));
            }
        },

        onRouterLocation: function() {
            this._blockModels = this._blockViews = [];

            this.disable();

            if (this._buttonView) {
                this._buttonView.remove();
                this._buttonView = null;
            }
        },

        onTouchMove: function(event) {
            event.preventDefault();
        },

        onScroll: function(event) {
            this.setLocationId();
        },

        onWheel: function(event) {
            if (event.deltaY > 0) {
                this.snapDown();
            } else {
                this.snapUp();
            }
        },

        onKeyDown: function(event) {
            var key = event.key || event.code || event.keyCode;
            this._isShiftKeyPressed = event.shiftKey;

            switch(key) {
                case "ArrowUp":
                case 38:
                    this.snapUp();
                    break;
                case "ArrowDown":
                case 40:
                    this.snapDown();
                    break;
                case "Tab":
                case 9:
                    //(this._isShiftKeyPressed) ? this.snapUp() : this.snapDown();
                    break;
            }
        },

        onKeyUp: function(event) {
            if (event.shiftKey) this._isShiftKeyPressed = false;
        },

        onSwipeUp: function(event) {
            this.snapDown();
        },

        onSwipeDown: function(event) {
            this.snapUp();
        },

        onButtonClick: function() {
            this.snapDown();
        },

        onWindowResize: function(screenSize) {
            this.scrollToId(this._locationId, 0);
        }

    });

    new ScrollSnap();

});

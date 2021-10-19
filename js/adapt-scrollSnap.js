import Adapt from 'core/js/adapt';
import ButtonView from './ButtonView';
import TWEEN from './TWEEN';
import WheelEvent from './WheelEvent';
import 'libraries/hammer.min';

class ScrollSnap extends Backbone.Controller {

  initialize() {
    _.bindAll(this, 'onWheel', 'onKeyDown', 'onKeyUp', 'onPreClick', 'onSwipeUp', 'onSwipeDown', 'onScroll', 'onWindowResize', 'onFocusIn', 'onPageElementScroll', 'animate');
    Object.assign(this, {
      _config: null,
      _buttonView: null,
      _locationId: null,
      _blockModels: [],
      _currentModel: null,
      _blockViews: [],
      _buttonViews: [],
      _hammer: null,
      _isShiftKeyPressed: false,
      direction: -1,
      level: 0,
      maxLevel: 200,
      wheelChainInterval: 200,
      _scrollTop: 0
    });
    this.listenToOnce(Adapt, 'adapt:start', this.onAdaptStart);
    requestAnimationFrame(this.animate);
  }

  animate(time) {
    requestAnimationFrame(this.animate);
    TWEEN.update(time);
  }

  addHtmlClass() {
    const $html = $('html');

    $html.addClass('scrollSnap');
    if (this._config._useNavigationOffset === false) $html.addClass('no-navigation-offset');
  }

  addScrollEvents() {
    this.removeScrollEvents();

    if (Adapt.device.screenSize === 'large') {
      window.addEventListener('click', this.onPreClick, { capture: true });
      window.addEventListener('touchmove', this.onTouchMove);
      window.addEventListener('wheel', this.onWheel);
      window.addEventListener('keydown', this.onKeyDown);
      window.addEventListener('keyup', this.onKeyUp);

      this._hammer = new window.Hammer(document.getElementById('wrapper'));
      this._hammer.get('swipe').set({ direction: window.Hammer.DIRECTION_ALL });
      this._hammer.on('swipeup', this.onSwipeUp);
      this._hammer.on('swipedown', this.onSwipeDown);
    } else {
      this.onScroll = _.debounce(this.onScroll, 1000);

      window.addEventListener('scroll', this.onScroll);
    }
  }

  removeScrollEvents() {
    window.removeEventListener('click', this.onPreClick, { capture: true });
    window.removeEventListener('touchmove', this.onTouchMove);
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('wheel', this.onWheel);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);

    if (this._hammer) this._hammer.destroy();
  }

  getCurrentModelIndex() {
    return this._blockModels.indexOf(this._currentModel);
  }

  getCurrentModel() {
    return this._currentModel;
  }

  getPageView() {
    return this._pageView;
  }

  setCurrentModel(model) {
    if (!model || this._currentModel === model) return;

    this._currentModel = model;
    this._locationId = model.get('_id');

    Adapt.trigger('scrollsnap:change:selected');
  }

  getIsFirstModelIndex(index) {
    return index === 0;
  }

  getIsLastModelIndex(index) {
    return index === (this._blockModels.length - 1);
  }

  scrollToId(id, duration) {
    const settings = {
      duration: (duration !== undefined) ? duration : this._config._scrollDuration || 400,
      complete: () => { this._isAnimating = false; }
    };

    if (Adapt.device.screenSize === 'large') {
      const offsetTop = (this._config._useNavigationOffset) ? -$('.navigation').outerHeight() / 2 : 0;
      settings.offset = { top: offsetTop };
    }

    if (this.$lastScrollTo) {
      this.$lastScrollTo.stop();
    }

    this._isAnimating = true;

    this.$lastScrollTo = $.scrollTo('.' + id, settings);
  }

  setLocationId() {
    let highestOnscreen = 0;
    let highestId;

    for (let i = 0, l = this._blockViews.length; i < l; i++) {
      const view = this._blockViews[i];
      const id = view.model.get('_id');
      const selector = '.' + id;
      const element = $(selector);
      const measurements = element.onscreen();

      if (!measurements.onscreen) continue;
      if (measurements.percentInview > highestOnscreen) {
        highestOnscreen = measurements.percentInview;
        highestId = id;
      }
    }

    const model = this._blockModels.filter(function(model) {
      return model.get('_id') === highestId;
    })[0];

    this.setCurrentModel(model);
  }

  snapUp() {
    const index = this.getCurrentModelIndex();

    if (this.getIsFirstModelIndex(index)) return;

    this.setCurrentModel(this._blockModels[index - 1]);

    this.scrollToId(this._locationId);

    this.updateButton();

    // console.log('scrollSnap::snapUp to', this._locationId);
    Adapt.a11y.focusNext('.' + this._locationId + ' .focuser');
    // console.log('scrollSnap::snapUp activeElement is now', document.activeElement);
  }

  snapDown() {
    const index = this.getCurrentModelIndex();

    if (this.getIsLastModelIndex(index)) return;

    if (this.isCurrentStepLocked()) return;

    this.setCurrentModel(this._blockModels[index + 1]);

    this.scrollToId(this._locationId);

    this.updateButton();

    // console.log('scrollSnap::snapDown to', this._locationId);
    Adapt.a11y.focusNext('.' + this._locationId + ' .focuser');
    // console.log('scrollSnap::snapDown activeElement is now', document.activeElement);
  }

  snapToStart() {
    this.setCurrentModel(this._blockModels[0]);

    this.scrollToId(this._locationId);

    this.updateButton();

    Adapt.a11y.focusNext('.' + this._locationId + ' .focuser');
  }

  snapToLimit() {
    let index = this._blockModels.findIndex(this.isBlockStepLocked);

    if (index < 0) {
      index = this._blockModels.length - 1;
    }

    this.setCurrentModel(this._blockModels[index]);

    this.scrollToId(this._locationId);

    this.updateButton();

    Adapt.a11y.focusNext('.' + this._locationId + ' .focuser');
  }

  snapToBlock(block) {
    this.setCurrentModel(block);

    this.scrollToId(this._locationId);

    this.updateButton();

    Adapt.a11y.focusNext('.' + this._locationId + ' .focuser');
  }

  onAdaptStart() {
    this._config = Adapt.course.get('_scrollSnap');

    this.addHtmlClass();

    this.listenTo(Adapt, {
      'pageView:preRender': this.onPagePreRender,
      'pageView:ready': this.onPageReady,
      'pageView:preRemove': this.onPagePreRemove,
      'view:addChild': this.onAddChildView,
      'view:childAdded': this.onChildAdded
    });
  }

  onPagePreRender(view) {
    if (!this.isScrollSnapView(view)) return;

    this._pageView = view;
    this._articlesAndBlocks = this._pageView.model.getAllDescendantModels(true).filter(m => m.get('_type') !== 'component');
    this._blockModels = view.model.findDescendantModels('blocks');

    const locationId = Adapt.location._currentId;
    let model = Adapt.findById(locationId);

    if (model.get('_type') !== 'block') model = this._blockModels[0];

    this.setCurrentModel(model);

    this.listenTo(Adapt, 'blockView:postRender', this.onBlockPostRender);
  }

  addPageEvents() {
    this.removePageEvents();

    this.listenTo(this._pageView.model, 'bubble:change:_isComplete', this.onChildComplete);

    window.addEventListener('resize', this.onWindowResize);

    $('body').on('focusin', this.onFocusIn);
  }

  removePageEvents() {
    window.removeEventListener('resize', this.onWindowResize);

    this.stopListening(this._pageView.model, 'bubble:change:_isComplete', this.onChildComplete);

    $('body').off('focusin', this.onFocusIn);
  }

  onPageElementScroll(event) {
    const target = event.target;
    const hasTargetChanged = this._scrollTarget !== target;

    if (hasTargetChanged) {
      this._scrollTop = target.scrollTop;
    }

    const scrollAmount = Math.abs(this._scrollTop - target.scrollTop);

    this._scrollTarget = target;
    this._scrollTop = target.scrollTop;
    // prevent insignificant movements registering a scroll event
    this._hasPageElementScrolled = hasTargetChanged || scrollAmount > 1;
  }

  isScrollSnapView(view) {
    let model = view.model;
    if (model.get('_type') !== 'page') {
      model = model.findAncestor('pages');
    }
    return model.has('_scrollSnap') && model.get('_scrollSnap')._isEnabled;
  }

  onPageReady(view) {
    if (!this.isScrollSnapView(view)) return;

    this.addPageEvents();

    this.addScrollEvents();

    this.scrollToId(this._locationId, 0);

    this.updateButton();

    Adapt.trigger('scrollsnap:start');
  }

  onPagePreRemove(view) {
    if (!this._pageView || !this.isScrollSnapView(view)) return;

    Adapt.trigger('scrollsnap:stop');

    this.removeScrollEvents();
    this.removePageEvents();

    $('.component__container').off('scroll', this.onPageElementScroll);

    this._buttonViews.forEach(buttonView => buttonView.remove());

    this._blockModels = [];
    this._blockViews = [];
    this._buttonViews = [];
    this._currentModel = this._pageView = null;
  }

  onBlockPostRender (view) {
    this._blockViews.push(view);
  }

  onTouchMove(event) {
    event.preventDefault();
  }

  onScroll(event) {
    this.setLocationId();
  }

  onKeyDown(event) {
    const key = event.key || event.code || event.keyCode;
    this._isShiftKeyPressed = event.shiftKey;
    // disable arrow keys to avoid conflict with screen readers
    switch (key) {
      // case 'ArrowUp':
      case 'PageUp':
      case 33:
      // case 38:
        this.snapUp();
        break;
      // case 'ArrowDown':
      case 'PageDown':
      case 34:
      // case 40:
        this.snapDown();
        break;
      case 'End':
      case 35:
        this.snapToLimit();
        break;
      case 'Home':
      case 36:
        this.snapToStart();
    }
  }

  onKeyUp(event) {
    if (event.shiftKey) this._isShiftKeyPressed = false;
  }

  onSwipeUp(event) {
    this.snapDown();
    this.blockClicks();
  }

  onSwipeDown(event) {
    this.snapUp();
    this.blockClicks();
  }

  /**
   * Stop scroll events triggering click on things like the mediaplayer
   */
  onPreClick(event) {
    if (!this.isBlockingClicks) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  /**
   * Stop scroll events triggering click on things like the mediaplayer
   */
  blockClicks() {
    this.isBlockingClicks = true;
    setTimeout(() => (this.isBlockingClicks = false));
  }

  first() {
    // screen readers can move to content without scrolling so ensure location is updated first
    this.setLocationId();
    this.snapToBlock(this._blockModels[0]);
  }

  next() {
    // screen readers can move to content without scrolling so ensure location is updated first
    this.setLocationId();
    this.snapDown();
  }

  onWindowResize(screenSize) {
    this.scrollToId(this._locationId, 0);
  }

  isBlockStepLocked(block) {
    return !block.get('_isOptional') && !block.get('_isComplete');
  }

  isCurrentStepLocked() {
    const index = this.getCurrentModelIndex();
    const block = this._blockModels[index];

    return this.isBlockStepLocked(block);
  }

  updateButton() {
    // console.log('scrollSnap::update button');

    const stepLockedBlockIndex = this._blockModels.findIndex(this.isBlockStepLocked);

    this._buttonViews.forEach((button, index) => {
      stepLockedBlockIndex >= 0 && index >= stepLockedBlockIndex ? button.hide() : button.show();
    });
  }

  onAddChildView(e) {
    if (!this.isScrollSnapView(e.target)) return;
    const model = e.model;
    if (model.get('_type') === 'component') return;
    const stepLockIndex = this._articlesAndBlocks.findIndex(m => m.get('_type') === 'block' && this.isBlockStepLocked(m));
    const childViewIndex = this._articlesAndBlocks.indexOf(model);
    if (childViewIndex > stepLockIndex) e.stop();
    this._stepLockIndex = stepLockIndex;
  }

  onChildAdded(view) {
    if (!this.isScrollSnapView(view)) return;
    const model = view.model;
    // console.warn('scrollSnap::onChildAdded', model.get('_id'));
    if (model.get('_type') !== 'block') return;

    const index = this._blockModels.indexOf(model);

    $('.' + model.get('_id') + ' .component__container').off('scroll', this.onPageElementScroll);
    $('.' + model.get('_id') + ' .component__container').on('scroll', this.onPageElementScroll);

    if ($('.' + model.get('_id') + ' .focuser').length === 0) {
      $('.' + model.get('_id') + ' .component__container').prepend('<div class="aria-label focuser" tabindex="-1"/>');
    }

    if (this._buttonViews[index]) return;

    let buttonView;

    if (index < this._blockModels.length - 1) {
      buttonView = new ButtonView({ model: new Backbone.Model(this._config._nextButton) });
    } else {
      buttonView = new ButtonView({ model: new Backbone.Model({ _isLast: true, ...this._config._lastButton }) });
    }

    this._buttonViews[index] = buttonView;
    $('.' + model.get('_id') + ' .component__container').append(buttonView.$el);
    this.updateButton();
  }

  onChildComplete(e) {
    const model = e.target;
    if (model.get('_type') !== 'block') return;
    let stepLockBlock = this._articlesAndBlocks.find(m => m.get('_type') === 'block' && this.isBlockStepLocked(m));
    if (!stepLockBlock) stepLockBlock = this._blockModels[this._blockModels.length - 1];
    // console.warn('scrollSnap::onChildComplete renderTo', stepLockBlock.get('_id'));
    this._pageView.renderTo(stepLockBlock.get('_id')).then(() => {
      this.updateButton();
      if (model.getChildren().some(child => child.get('_isQuestionType'))) {
        // this.snapDown();
      }
      Adapt.trigger('scrollsnap:change:locking');
    });
  }

  onFocusIn(e) {
    const blockId = $(e.target).parents('.block').data('adapt-id');
    if (blockId) {
      const model = this._blockModels.find(block => block.get('_id') === blockId);
      if (this._currentModel !== model) {
        // console.warn('scrollSnap::onFocusIn to block', blockId);
        this.setCurrentModel(model);
        this.scrollToId(this._locationId);
      }
    }
  }

  onWheel(event) {
    this.wheeled(event);
    _.defer(() => {
      if (this._hasPageElementScrolled) {
        // console.warn('SCROLLED - PREVENT SNAP');
        return;
      }
      if (this._canSnap && !this._isAnimating) {
        this._canSnap = false;
        if (event.deltaY > 0) {
          this.snapDown();
        } else {
          this.snapUp();
        }
      }
      if (this._isAnimating) {
        // console.warn('ANIMATING - PREVENT SNAP')
      }
    });
  }

  wheeled (e) {
    const dir = e.deltaY < 0 ? 1 : -1;
    if (this.direction !== dir) {
      this.level = 0;
      this.direction = dir;
      this.tween?.stop();
    }
    let t = false;
    if (this.wheelChainTimeout) {
      clearTimeout(this.wheelChainTimeout);
      this.wheelChainTimeout = null;
    } else {
      t = true;
    }
    this.wheelChainTimeout = setTimeout(this.wheelEnd.bind(this), this.wheelChainInterval);
    const we = (new WheelEvent()).initFromEvent(e);
    we.flip();
    we.isStart = t;
    if (we.isStart) {
      this._canSnap = false;
      this.tween?.stop();
    }
    this.consumeScroll(we);
    // console.log('original', e.deltaY, e.wheelDeltaY, this.level)
  }

  wheelEnd () {
    this.wheelChainTimeout = null;
    const we = new WheelEvent(0, 0, 0, false, true);
    this._isWaitingForWheelEnd = false;
    this._hasPageElementScrolled = false;
    this.consumeScroll(we);
  }

  easeLevel(duration) {
    const t = this;
    if (this.tween) {
      this.tween.stop();
    }
    this.tween = new TWEEN.Tween({ level: this.level })
      .to({ level: 0 }, duration)
      .easing(TWEEN.Easing.Quadratic.Out)
      .onUpdate(function(obj) {
        t.level = obj.level;
        // console.log('eased to', t.level);
      })
      .onComplete(() => {
      })
      .start();
  }

  consumeScroll (e) {
    this.level += e.deltaY * this.direction;
    // console.log('consumeScroll', e.deltaY, this.level);
    if (this.level >= this.maxLevel) {
      // the user has moved the mouse wheel sufficiently to gesture snapping up/down
      this.easeLevel(250); // TODO: check if this needs to have non-zero duration
      // prevent queued wheel events causing multiple snaps
      if (!this._isWaitingForWheelEnd) {
        // if (!this._canSnap) console.warn('GESTURE')
        this._canSnap = true;
      } else {
        // if (!this._canSnap) console.warn('QUEUED WHEEL EVENTS - PREVENT FURTHER SNAPS')
      }
      this._isWaitingForWheelEnd = true;
    } else if (e.isEnd) {
      // wheel events have ceased and the content will have had chance to complete any scroll
      // gradually decrement level
      this.easeLevel(1000);
    }
  }

}

export default (Adapt.scrollsnap = new ScrollSnap());

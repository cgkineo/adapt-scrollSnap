import Adapt from 'core/js/adapt';
import Wheel from './Wheel';
import Swipe from './Swipe';
import Keyboard from './Keyboard';
import Scroll from './Scroll';
import Touch from './Touch';
import Device from './Device';
import Focus from './Focus';
import Page from './Page';
import Config from './Config';
import Models from './Models';
import Views from './Views';
import Classes from './Classes';
import Navigation from './Navigation.js';
import Block from './Block';
import State from './State';

class ScrollSnap extends Backbone.Controller {

  initialize() {
    this._page = new Page({ controller: this });
    this._block = new Block({ controller: this });
    this._wheel = new Wheel({ controller: this });
    this._swipe = new Swipe({ controller: this });
    this._keyboard = new Keyboard({ controller: this });
    this._touch = new Touch({ controller: this });
    this._scroll = new Scroll({ controller: this });
    this._focus = new Focus({ controller: this });
    this._device = new Device({ controller: this });
    State.canSnap = true;
    this.reset();
    this.listenToOnce(Adapt, 'adapt:start', this.onAdaptStart);
  }

  reset() {
    this._device.reset();
  }

  addEvents() {
    this.removeEvents();
    if (!Config.canUseScrollSnap) {
      this._scroll.addEvents();
      return;
    }
    this._block.addEvents();
    this._wheel.addEvents();
    if (Config.isSwipeEnabled) this._swipe.addEvents();
    this._keyboard.addEvents();
    this._touch.addEvents();
    this._focus.addEvents();
  }

  removeEvents() {
    this._block.removeEvents();
    this._wheel.removeEvents();
    this._swipe.removeEvents();
    this._keyboard.removeEvents();
    this._touch.removeEvents();
    this._scroll.removeEvents();
    this._focus.removeEvents();
  }

  scrollToId(id, duration, isForced = false) {
    if (!State.canSnap) return;
    if (State.locationId === id && !isForced) return;
    this.onPreScrollTo();
    const previousModelConfig = Config.getModelConfig(State.previousModel);
    const directionType = Models.directionType;
    duration = duration ?? Config.getScrollDuration(directionType, previousModelConfig) ?? Config.getScrollDuration(directionType) ?? 400;
    const settings = {
      duration: duration,
      complete: () => {
        Classes.updateHtmlClasses();
        State.locationId = id;
        State.currentModel.set('_isVisited', true);
        State.isAnimating = false;
        if (isForced) return;
        Navigation.update();
        Adapt.trigger('scrollsnap:scroll:complete');
      }
    };
    if (Config.canUseScrollSnap) {
      const offsetTop = (Config.useNavigationOffset) ? -$('.nav').outerHeight() : 0;
      settings.offset = { top: offsetTop };
    }
    if (this.$lastScrollTo) this.$lastScrollTo.stop();
    State.isAnimating = true;
    this.$lastScrollTo = $.scrollTo(`.${id}`, settings);
  }

  snapUp() {
    const currentIndex = Models.currentIndex;
    if (Models.isFirstIndex(currentIndex)) return;
    const index = currentIndex - 1;
    this.snapToBlockIndex(index);
  }

  snapDown() {
    const currentIndex = Models.currentIndex;
    if (Models.isLastIndex(currentIndex)) return;
    if (Models.isCurrentStepLocked) return;
    const index = currentIndex + 1;
    this.snapToBlockIndex(index);
  }

  snapToStart() {
    this.snapToBlockIndex(0);
  }

  snapToLimit() {
    let index = Models.stepLockedBlockIndex;
    if (index < 0) index = Models.lastIndex;
    this.snapToBlockIndex(index);
  }

  snapToBlockIndex(index) {
    if (!State.canSnap) return;
    const model = Models.blocks[index];
    State.currentModel = model;
    this.scrollToId(model.get('_id'));
  }

  first() {
    // screen readers can move to content without scrolling so ensure location is updated first
    Views.setLocationId();
    this.snapToBlockIndex(0);
  }

  previous() {
    // screen readers can move to content without scrolling so ensure location is updated first
    Views.setLocationId();
    this.snapUp();
  }

  next() {
    // screen readers can move to content without scrolling so ensure location is updated first
    Views.setLocationId();
    this.snapDown();
  }

  onAdaptStart() {
    if (!Config.isEnabled) return;
    this._page.addEvents();
    this._device.addEvents();
  }

  onPreScrollTo() {
    const model = State.currentModel;
    const isVisited = model.get('_isVisited');
    if (!isVisited) return;
    const config = Config.getModelConfig(model)?._preSnap;
    const isReRender = config?._isReRender;
    const isReset = config?._isReset;
    if (!isReRender && !isReset) return;
    const components = model.getChildren();
    components.forEach(model => {
      if (isReset) model.reset(isReset);
      if (!isReRender) return;
      const view = Adapt.findViewByModelId(model.get('_id'));
      if (view) view.render();
    });
  }

}

export default (Adapt.scrollsnap = new ScrollSnap());

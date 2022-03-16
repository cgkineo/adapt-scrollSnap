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
    this.wheel = new Wheel({ controller: this });
    this.swipe = new Swipe({ controller: this });
    this.keyboard = new Keyboard({ controller: this });
    this.touch = new Touch({ controller: this });
    this.scroll = new Scroll({ controller: this });
    this.device = new Device({ controller: this });
    this.focus = new Focus({ controller: this });
    this.page = new Page({ controller: this });
    this.block = new Block({ controller: this });
    this.canSnap = true;
    this.reset();
    this.listenToOnce(Adapt, 'adapt:start', this.onAdaptStart);
  }

  reset() {
    this.device.reset();
  }

  onAdaptStart() {
    if (!Config.isEnabled) return;
    this.page.addEvents();
  }

  addEvents() {
    this.removeEvents();
    if (!Config.isScrollSnapSize) {
      this.scroll.addEvents();
      return;
    }
    this.wheel.addEvents();
    this.keyboard.addEvents();
    this.touch.addEvents();
    this.device.addEvents();
    this.focus.addEvents();
    this.block.addEvents();
    if (Config.isSwipeEnabled) this.swipe.addEvents();
  }

  removeEvents() {
    this.wheel.removeEvents();
    this.swipe.removeEvents();
    this.keyboard.removeEvents();
    this.touch.removeEvents();
    this.scroll.removeEvents();
    this.device.removeEvents();
    this.focus.removeEvents();
    this.block.removeEvents();
  }

  scrollToId(id, duration, isForced = false) {
    if (!this.canSnap) return;
    if (State.locationId === id && !isForced) return;
    this.onPreScrollTo();
    const previousModelConfig = Config.getModelConfig(State.previousModel);
    const directionType = Models.getDirectionType();
    duration = duration ?? Config.getScrollDuration(directionType, previousModelConfig) ?? Config.getScrollDuration(directionType) ?? 400;
    const settings = {
      duration: duration,
      complete: () => {
        Classes.updateHtmlClasses();
        State.locationId = id;
        State.currentModel.set('_isVisited', true);
        this.isAnimating = false;
        if (isForced) return;
        Navigation.update();
        Adapt.trigger('scrollsnap:scroll:complete');
      }
    };
    if (Config.isScrollSnapSize) {
      const offsetTop = (Config.useNavigationOffset) ? -$('.nav').outerHeight() : 0;
      settings.offset = { top: offsetTop };
    }
    if (this.$lastScrollTo) this.$lastScrollTo.stop();
    this.isAnimating = true;
    this.$lastScrollTo = $.scrollTo(`.${id}`, settings);
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

  snapUp() {
    const currentIndex = Models.getCurrentModelIndex();
    if (Models.getIsFirstModelIndex(currentIndex)) return;
    const index = currentIndex - 1;
    this.snapToBlockIndex(index);
  }

  snapDown() {
    const currentIndex = Models.getCurrentModelIndex();
    if (Models.getIsLastModelIndex(currentIndex)) return;
    if (Models.isCurrentStepLocked) return;
    const index = currentIndex + 1;
    this.snapToBlockIndex(index);
  }

  snapToStart() {
    this.snapToBlockIndex(0);
  }

  snapToLimit() {
    let index = Models.stepLockIndex;
    if (index < 0) index = Models.lastModelIndex;
    this.snapToBlockIndex(index);
  }

  snapToBlockIndex(index) {
    if (!this.canSnap) return;
    State.setCurrentModel(Models.blockModels[index]);
    this.scrollToId(State.currentModel.get('_id'));
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

}

export default (Adapt.scrollsnap = new ScrollSnap());

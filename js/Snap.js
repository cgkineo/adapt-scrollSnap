import Adapt from 'core/js/adapt';
import Data from 'core/js/data';
import a11y from 'core/js/a11y';
import Config from './Config';
import Models from './Models';
import Views from './Views';
import State from './State';
import Classes from './Classes';
import Navigation from './Navigation.js';
import Scroll from './Scroll';
import A11y from './A11y';
import _ from 'underscore';

export default class Snap extends Backbone.Controller {

  static up() {
    const currentIndex = Models.currentIndex;
    if (Models.isFirstIndex(currentIndex)) return;
    const index = currentIndex - 1;
    this.toBlockIndex(index);
  }

  static down() {
    const currentIndex = Models.currentIndex;
    if (Models.isLastIndex(currentIndex)) return;
    if (Models.isCurrentStepLocked) return;
    const index = currentIndex + 1;
    this.toBlockIndex(index);
  }

  static toStart() {
    this.toBlockIndex(0);
  }

  static toLimit() {
    let index = Models.stepLockedBlockIndex;
    if (index < 0) index = Models.lastIndex;
    this.toBlockIndex(index);
  }

  static toBlockIndex(index) {
    if (!State.canSnap) return;
    const model = Models.blocks[index];
    this.toId(model.get('_id'));
  }

  static _preScrollTo() {
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
      const view = Data.findViewByModelId(model.get('_id'));
      if (view) view.render();
    });
  }

  static toId(id, duration, isForced = false) {
    if (!State.canSnap) return;
    if (State.locationId === id && !isForced) return;
    if (!isForced) Navigation.pause();
    // capture previous view before updating `State.currentModel`
    const $previousView = Views.currentBlockView.$el;
    if ($previousView) $previousView.removeClass('is-inview');
    State.currentModel = Data.findById(id);
    const $currentView = Views.currentBlockView.$el;
    this._preScrollTo();
    A11y.showAll();
    _.delay(() => {
      a11y.focusFirst($currentView, { preventScroll: true, defer: false });
      const previousModelConfig = Config.getModelConfig(State.previousModel);
      const directionType = Models.directionType;
      duration = duration ?? Config.getScrollDuration(directionType, previousModelConfig) ?? Config.getScrollDuration(directionType) ?? 400;
      const settings = {
        duration,
        offset: { top: Scroll.offset.top },
        complete: () => {
          Classes.updateHtmlClasses();
          State.locationId = id;
          State.currentModel.set('_isVisited', true);
          State.isAnimating = false;
          $currentView.addClass('is-inview');
          A11y.hideOthers(() => {
            a11y.focusFirst($currentView, { preventScroll: true, defer: true });
            Navigation.play();
            Navigation.update();
            Adapt.trigger('scrollsnap:scroll:complete');
          });
        }
      };
      if (this.$lastScrollTo) this.$lastScrollTo.stop();
      State.isAnimating = true;
      this.$lastScrollTo = $.scrollTo(`.${id}`, settings);
    }, 100);
  }

  static first() {
    // screen readers can move to content without scrolling so ensure location is updated first
    Views.setLocationId();
    this.toBlockIndex(0);
  }

  static previous() {
    // screen readers can move to content without scrolling so ensure location is updated first
    Views.setLocationId();
    this.up();
  }

  static next() {
    // screen readers can move to content without scrolling so ensure location is updated first
    Views.setLocationId();
    this.down();
  }

  static scroll({ to = null, direction = null, deltaY = null }) {
    if (State.isAnimating) return;
    const currentBlockView = Views.currentBlockView;
    if (!Views.hasScrolling(currentBlockView)) return false;
    if (direction === 'up') deltaY = -1;
    if (direction === 'down') deltaY = 1;
    if (to) {
      if (!$.contains(currentBlockView.el, to)) return;
      // possibly add code to scroll the block to the item in focus
      return;
    }
    const offset = Scroll.offset;
    const blockMeasurement = currentBlockView.$el.onscreen();
    blockMeasurement.top += offset.top;
    blockMeasurement.bottom += offset.bottom;
    const minScrollAmount = -80;
    let finalScrollDelta = 0;
    if (-deltaY < 0 && parseInt(blockMeasurement.bottom) < 0) {
      finalScrollDelta = -Math.max(minScrollAmount, blockMeasurement.bottom);
    } else if (-deltaY > 0 && parseInt(blockMeasurement.top) < 0) {
      finalScrollDelta = Math.max(minScrollAmount, blockMeasurement.top);
    }
    // No scroll amount
    if (!finalScrollDelta || Math.abs(finalScrollDelta) < Math.abs(2)) return false;
    $('html')[0].scrollTop += finalScrollDelta;
    Navigation.update();
    return true;
  }

}

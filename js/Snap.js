import Models from './Models';
import Views from './Views';
import State from './State';
import Adapt from 'core/js/adapt';
import Config from './Config';
import Classes from './Classes';
import Navigation from './Navigation.js';
import Scroll from './Scroll';
import A11y from './A11y';
import a11y from 'core/js/a11y';

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
    State.currentModel = model;
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
      const view = Adapt.findViewByModelId(model.get('_id'));
      if (view) view.render();
    });
  }

  static toId(id, duration, isForced = false) {
    if (!State.canSnap) return;
    if (State.locationId === id && !isForced) return;
    if (!isForced) Navigation.hide();
    A11y.showAll();
    a11y.focusFirst(Views.currentBlockView.$el, { preventScroll: true, defer: false });
    this._preScrollTo();
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
        if (isForced) return;
        Navigation.update();
        Navigation.show();
        A11y.hideOthers(() => {
          a11y.focusFirst(Views.currentBlockView.$el, { preventScroll: true, defer: false });
        });
        Adapt.trigger('scrollsnap:scroll:complete');
      }
    };
    if (this.$lastScrollTo) this.$lastScrollTo.stop();
    State.isAnimating = true;
    this.$lastScrollTo = $.scrollTo(`.${id}`, settings);
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

}

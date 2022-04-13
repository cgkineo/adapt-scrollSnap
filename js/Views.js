import Adapt from 'core/js/adapt';
import router from 'core/js/router';
import Config from './Config';
import Models from './Models';
import State from './State';

export default class Views {

  static get page() {
    if (!Models.isPage(Adapt.parentView?.model)) return null;
    return Adapt.parentView;
  }

  static get blocks() {
    function getDescendantViews(parentView) {
      const childViews = parentView.getChildViews();
      if (!childViews) return [];
      return childViews.flatMap(v => [v, ...getDescendantViews(v)]);
    }
    const allViews = getDescendantViews(this.page);
    return allViews.filter(view => Models.isBlock(view.model));
  }

  static get currentBlockView() {
    return this.blocks.find(v => v.model === State.currentModel);
  }

  static isScrollSnap(view) {
    if (!view) return false;
    const model = Models.isPage(view.model)
      ? view.model
      : view.model.findAncestor('page');
    const config = Config.getModelConfig(model);
    return Boolean(config?._isEnabled !== false && Config.isEnabled);
  }

  static get isScrollSnapActive() {
    return Boolean(this.isScrollSnap(Adapt.parentView) && Config.canUseScrollSnap);
  }

  static hasScrolling(view) {
    const $el = view.$el;
    const blockHeight = Math.floor($el.height());
    const windowHeight = Math.floor($(window).height());
    const hasScrolling = blockHeight > windowHeight;
    const classname = 'has-scrolling';
    (hasScrolling) ? $el.addClass(classname) : $el.removeClass(classname);
    return hasScrolling;
  }

  static setLocationId() {
    let highestOnscreen = 0;
    let highestId;
    this.blocks.forEach(view => {
      const id = view.model.get('_id');
      const measurements = view.$el.onscreen();
      if (!measurements.onscreen) return;
      if (measurements.percentInview < highestOnscreen) return;
      highestOnscreen = measurements.percentInview;
      highestId = id;
    });
    const model = Models.blocks.find(model => model.get('_id') === highestId);
    if (!model) return;
    State.currentModel = model;
    State.locationId = highestId;
  }

  static async checkRenderType() {
    const doNotRefresh = (Views.isScrollSnapActive && State.isScrollSnapViewRendered) || (!Views.isScrollSnapActive && !State.isScrollSnapViewRendered);
    const isPage = Adapt.parentView?.model?.isTypeGroup('page');
    if (!isPage || doNotRefresh) return;
    router.navigateToCurrentRoute();
  }

}

import Adapt from 'core/js/adapt';
import Classes from './Classes';
import Models from './Models';
import State from './State';
import Navigation from './Navigation';
import Config from './Config';
import Views from './Views';

export default class Page extends Backbone.Controller {

  initialize({ controller }) {
    this._controller = controller;
  }

  addEvents() {
    this.listenTo(Adapt, {
      'pageView:preRender': this.onPagePreRender,
      'pageView:postRender': this.onPagePostRender,
      'pageView:ready': this.onPageReady,
      'pageView:preRemove': this.onPagePreRemove,
      'page:scrollTo': this.onPageScrollTo
    });
  }

  removeEvents() {
    this.stopListening(Adapt, {
      'pageView:preRender': this.onPagePreRender,
      'pageView:postRender': this.onPagePostRender,
      'pageView:ready': this.onPageReady,
      'pageView:preRemove': this.onPagePreRemove,
      'page:scrollTo': this.onPageScrollTo
    });
  }

  onPagePreRender(view) {
    if (!Views.isScrollSnap(view)) return;
    Classes.addHtmlClasses();
    Models.updateLocking();
    let model = Adapt.findById(Adapt.location._currentId);
    if (!Models.isBlock(model)) model = Models.blocks[0];
    State.currentModel = model;
  }

  onPagePostRender(view) {
    if (!Views.isScrollSnap(view)) return;
    Navigation.add();
  }

  onPageReady(view) {
    if (!Views.isScrollSnap(view)) return;
    this._controller.addEvents();
    this._controller.scrollToId(State.currentModel.get('_id'), 0);
    Adapt.trigger('scrollsnap:start');
  }

  onPagePreRemove(view) {
    if (!Views.page || !Views.isScrollSnap(view)) return;
    Classes.removeHtmlClasses();
    Adapt.trigger('scrollsnap:stop');
    this._controller.removeEvents();
    Models.blocks.forEach(model => this.stopListening(model));
    Navigation.remove();
    this._controller.reset();
  }

  onPageScrollTo(selector) {
    if (!Config.canUseScrollSnap) return;
    const options = { pluginName: 'scrollSnap' };
    // prevent scrolling without navigation offset and control via plugin
    Adapt.set('_canScroll', false, options);
    _.defer(() => {
      Adapt.set('_canScroll', true, options);
      let id = selector.replace('.', '');
      let model = Adapt.findById(id);
      if (!model) return;
      if (Models.isComponent(model)) {
        model = model.getParent();
        id = model.get('_id');
      }
      if (!Models.isBlock(model)) return;
      State.currentModel = model;
      this._controller.scrollToId(id);
    });
  }

}

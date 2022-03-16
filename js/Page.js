import Adapt from 'core/js/adapt';
import Classes from './Classes';
import Models from './Models';
import State from './State';
import Navigation from './Navigation';
import Config from './Config';
import Views from './Views';

export default class Page extends Backbone.Controller {

  initialize({ controller }) {
    this.controller = controller;
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
    if (!Models.isBlock(model)) model = Models.blockModels[0];
    Models.setCurrentModel(model);
  }

  onPagePostRender(view) {
    if (!Views.isScrollSnap(view)) return;
    Navigation.add();
  }

  onPageReady(view) {
    if (!Views.isScrollSnap(view)) return;
    this.controller.addEvents();
    this.controller.scrollToId(State.currentModel.get('_id'), 0);
    Adapt.trigger('scrollsnap:start');
  }

  onPagePreRemove(view) {
    if (!Views.pageView || !Views.isScrollSnap(view)) return;
    Classes.removeHtmlClasses();
    Adapt.trigger('scrollsnap:stop');
    this.controller.removeEvents();
    Models.blockModels.forEach(model => this.stopListening(model));
    Navigation.remove();
    this.controller.reset();
  }

  onPageScrollTo(selector) {
    if (!Config.isScrollSnapSize) return;
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
      Models.setCurrentModel(model);
      this.controller.scrollToId(id);
    });
  }

}

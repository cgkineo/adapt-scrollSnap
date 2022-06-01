import Adapt from 'core/js/adapt';
import Data from 'core/js/data';
import Location from 'core/js/location';
import Classes from './Classes';
import Models from './Models';
import State from './State';
import Navigation from './Navigation';
import Config from './Config';
import Views from './Views';
import Snap from './Snap';
import _ from 'underscore';

export default class Page extends Backbone.Controller {

  initialize({ controller }) {
    this._controller = controller;
    this.onPageResize = _.debounce(this.onPageResize.bind(this), 50);
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
    if (!Views.isScrollSnapActive) return;
    State.isScrollSnapViewRendered = true;
    State.isTrickleEnabled = false;
    this._controller.addEvents();
    Classes.addHtmlClasses();
    Models.updateLocking();
    Views.page.$el.on('resize', this.onPageResize);
    let model = Data.findById(Location._currentId);
    if (!Models.isBlock(model)) model = Models.blocks[0];
    State.currentModel = model;
  }

  onPagePostRender(view) {
    if (!Views.isScrollSnapActive) return;
    Navigation.add({ Snap });
  }

  onPageReady(view) {
    if (!Views.isScrollSnapActive) return;
    State.canSnap = true;
    State.canScroll = true;
    Snap.toId(State.currentModel.get('_id'), 0);
    Adapt.trigger('scrollsnap:start');
  }

  onPagePreRemove(view) {
    if (!State.isScrollSnapViewRendered || !Views.isScrollSnap(view)) return;
    State.isTrickleEnabled = true;
    Classes.removeHtmlClasses();
    Adapt.trigger('scrollsnap:stop');
    this._controller.removeEvents();
    Models.blocks.forEach(model => this.stopListening(model));
    Navigation.remove();
    State.canSnap = false;
    State.canScroll = false;
    Views.page.$el.off('resize', this.onPageResize);
    this._controller.reset();
    State.isScrollSnapViewRendered = false;
  }

  onPageScrollTo(selector, settings) {
    if (!Config.canUseScrollSnap || !Config.getModelConfig(Adapt.parentView.model)?._isEnabled) return;
    const options = { pluginName: 'scrollSnap' };
    // prevent scrolling without navigation offset and control via plugin
    Adapt.set('_canScroll', false, options);
    _.defer(() => {
      Adapt.set('_canScroll', true, options);
      let id = selector.replace('.', '');
      let model = Data.findById(id);
      if (!model) return;
      if (Models.isComponent(model)) {
        model = model.getParent();
        id = model.get('_id');
      }
      if (!Models.isBlock(model)) return;
      State.currentModel = model;
      Snap.toId(id, settings?.duration);
    });
  }

  onPageResize() {
    Navigation.update();
  }

}

import Adapt from 'core/js/adapt';
import Config from './Config';
import ScrollControlsView from './ScrollControlsView';

export default class Menu extends Backbone.Controller {

  initialize() {
    this.hasAddedEvents = false;
    this.isGlobal = Config.global._isGlobalMenuScroll ?? true;
    if (this.isGlobal) this.addEvents();
  }

  addEvents() {
    if (this.isGlobal && this.hasAddedEvents) return;
    this.hasAddedEvents = true;
    this.listenTo(Adapt, {
      'menuView:postRender': this.onMenuViewPostRender,
      remove: this.onRemove
    });
  }

  removeEvents() {
    if (this.isGlobal) return;
    this.stopListening(Adapt, {
      'menuView:postRender': this.onMenuViewPostRender,
      remove: this.onRemove
    });
  }

  onMenuViewPostRender(view) {
    this.view = view;
    this.view.scrollControlsView = new ScrollControlsView({
      $parent: $('body'),
      $scrollContainer: $('html')
    });
  }

  onRemove() {
    if (!this.view) return;
    this.view.scrollControlsView.remove();
    this.view = null;
  }

}

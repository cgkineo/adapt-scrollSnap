import Adapt from 'core/js/adapt';
import Config from './Config';
import ScrollControlsView from './ScrollControlsView';

export default class Notify extends Backbone.Controller {

  initialize() {
    this.hasAddedEvents = false;
    this.isGlobal = Config.global._isGlobalNotifyScroll ?? true;
    if (this.isGlobal) this.addEvents();
  }

  addEvents() {
    if (this.isGlobal && this.hasAddedEvents) return;
    this.hasAddedEvents = true;
    this.listenTo(Adapt, {
      'notify:opened': this.onNotifyOpened,
      'notify:closed': this.onNotifyClosed
    });
  }

  removeEvents() {
    if (this.isGlobal) return;
    this.stopListening(Adapt, {
      'notify:opened': this.onNotifyOpened,
      'notify:closed': this.onNotifyClosed
    });
  }

  onNotifyOpened(view) {
    view.scrollControlsView = new ScrollControlsView({
      $parent: view.$el,
      $scrollContainer: view.$('.notify__popup')
    });
  }

  onNotifyClosed(view) {
    view.scrollControlsView.remove();
  }

}

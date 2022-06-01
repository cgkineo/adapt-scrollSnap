import Adapt from 'core/js/adapt';
import Config from './Config';
import ScrollControlsView from './ScrollControlsView';
import State from './State';
import Views from './Views';

export default class Popups extends Backbone.Controller {

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
      'notify:closed': this.onNotifyClosed,
      'drawer:opened': this.onDrawerOpened,
      'drawer:closed': this.onDrawerClosed
    });
  }

  removeEvents() {
    if (this.isGlobal) return;
    this.stopListening(Adapt, {
      'notify:opened': this.onNotifyOpened,
      'notify:closed': this.onNotifyClosed,
      'drawer:opened': this.onDrawerOpened,
      'drawer:closed': this.onDrawerClosed
    });
  }

  onNotifyOpened(view) {
    view.scrollControlsView = new ScrollControlsView({
      $parent: view.$el,
      $scrollContainer: view.$('.notify__popup')
    });
    State.canScroll = false;
    State.canSnap = false;
  }

  onNotifyClosed(view) {
    view.scrollControlsView.remove();
    State.canScroll = true;
    State.canSnap = true;
  }

  onDrawerOpened(view) {
    if (!Views.isScrollSnapActive) return;
    State.canScroll = false;
    State.canSnap = false;
  }

  onDrawerClosed(view) {
    if (!Views.isScrollSnapActive) return;
    State.canScroll = true;
    State.canSnap = true;
  }

}

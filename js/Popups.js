import Adapt from 'core/js/adapt';
import Config from './Config';
import ScrollControlsView from './ScrollControlsView';
import State from './State';
import Views from './Views';

export default class Popups extends Backbone.Controller {

  addEvents() {
    this.listenTo(Adapt, {
      'notify:opened': this.onNotifyOpened,
      'notify:closed': this.onNotifyClosed,
      'drawer:opened': this.onDrawerOpened,
      'drawer:closed': this.onDrawerClosed
    });
  }

  removeEvents() {
    this.stopListening(Adapt, {
      'notify:opened': this.onNotifyOpened,
      'notify:closed': this.onNotifyClosed,
      'drawer:opened': this.onDrawerOpened,
      'drawer:closed': this.onDrawerClosed
    });
  }

  onNotifyOpened(view) {
    if (!Views.isScrollSnapActive) return;
    State.canScroll = false;
    State.canSnap = false;
    if (!Config.isGlobalNotifyScroll) return;
    view.scrollControlsView = new ScrollControlsView({
      $parent: view.$el,
      $scrollContainer: view.$('.notify__popup')
    });
  }

  onNotifyClosed(view) {
    if (!Views.isScrollSnapActive) return;
    State.canScroll = true;
    State.canSnap = true;
    if (!Config.isGlobalNotifyScroll) return;
    view.scrollControlsView.remove();
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

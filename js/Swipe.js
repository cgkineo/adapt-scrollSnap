import 'libraries/hammer.min';
import Snap from './Snap';
import State from './State';

export default class Swipe extends Backbone.Controller {

  initialize({ controller }) {
    this._controller = controller;
    _.bindAll(this, 'onPreClick', 'onSwipeUp', 'onSwipeDown');
    this._hammer = null;
  }

  addEvents() {
    this._hammer = new window.Hammer(document.getElementById('wrapper'), { touchAction: 'pan-y' });
    this._hammer.get('swipe').set({ direction: window.Hammer.DIRECTION_VERTICAL });
    this._hammer.on('swipeup', this.onSwipeUp);
    this._hammer.on('swipedown', this.onSwipeDown);
    window.addEventListener('click', this.onPreClick, { capture: true });
  }

  removeEvents() {
    if (this._hammer) this._hammer.destroy();
    window.removeEventListener('click', this.onPreClick, { capture: true });
  }

  /**
   * Stop scroll events triggering click on things like the mediaplayer
   */
  blockClicks() {
    this.isBlockingClicks = true;
    setTimeout(() => (this.isBlockingClicks = false));
  }

  /**
   * Stop scroll events triggering click on things like the mediaplayer
   */
  onPreClick(event) {
    if (!this.isBlockingClicks) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  onSwipeUp(event) {
    if (!State.canScroll || !State.canSnap) return;
    event.preventDefault();
    Snap.down();
    this.blockClicks();
  }

  onSwipeDown(event) {
    if (!State.canScroll || !State.canSnap) return;
    event.preventDefault();
    Snap.up();
    this.blockClicks();
  }

}

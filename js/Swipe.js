import 'libraries/hammer.min';

export default class Swipe extends Backbone.Controller {

  initialize({ controller }) {
    _.bindAll(this, 'onPreClick', 'onSwipeUp', 'onSwipeDown');
    this.controller = controller;
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
  onPreClick(event) {
    if (!this.isBlockingClicks) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  /**
   * Stop scroll events triggering click on things like the mediaplayer
   */
  blockClicks() {
    this.isBlockingClicks = true;
    setTimeout(() => (this.isBlockingClicks = false));
  }

  onSwipeUp(event) {
    event.preventDefault();
    this.controller.snapDown();
    this.blockClicks();
  }

  onSwipeDown(event) {
    event.preventDefault();
    this.controller.snapUp();
    this.blockClicks();
  }

}

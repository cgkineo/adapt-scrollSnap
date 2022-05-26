import Notify from 'core/js/notify';
import Views from './Views';
import State from './State';
import Scroll from './Scroll';
import Navigation from './Navigation';

export default class Touch extends Backbone.Controller {

  initialize() {
    _.bindAll(this, 'onTouchMove', 'onTouchStart', 'onTouchEnd');
  }

  addEvents() {
    const config = { passive: false, capture: false };
    window.addEventListener('touchstart', this.onTouchStart, config);
    window.addEventListener('touchmove', this.onTouchMove, config);
    window.addEventListener('touchend', this.onTouchEnd, config);
  }

  removeEvents() {
    const config = { passive: false, capture: false };
    window.removeEventListener('touchstart', this.onTouchStart, config);
    window.removeEventListener('touchmove', this.onTouchMove, config);
    window.removeEventListener('touchend', this.onTouchEnd, config);
  }

  onTouchStart(event) {
    if (Notify.stack.length > 0) return;
    this._start = event;
  }

  onTouchMove(event) {
    if (Notify.stack.length > 0) return;
    event.preventDefault();
    event.deltaY = (event.touches[0].clientY - this._start.touches[0].clientY);
    // check to see if section can be scrolled further here
    const currentBlockView = Views.currentBlockView;
    if (!Views.hasScrolling(currentBlockView)) return;
    const offset = Scroll.offset;
    const measure = currentBlockView.$el.onscreen();
    measure.top += offset.top;
    measure.bottom += offset.bottom;
    const scrollAmount = -Math.abs(event.deltaY);
    if (event.deltaY < 0 && parseInt(measure.bottom) < 0) {
      $('html')[0].scrollTop -= Math.max(scrollAmount, measure.bottom);
      State.canSnap = false;
      Navigation.update();
      return;
    }
    if (event.deltaY > 0 && parseInt(measure.top) < 0) {
      $('html')[0].scrollTop += Math.max(scrollAmount, measure.top);
      State.canSnap = false;
      Navigation.update();
    }
  }

  onTouchEnd() {
    if (Notify.stack.length > 0) return;
    State.canSnap = true;
    Navigation.update();
  }

}

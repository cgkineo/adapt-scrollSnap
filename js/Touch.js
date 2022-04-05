import Views from './Views';

export default class Touch extends Backbone.Controller {

  initialize({ controller }) {
    _.bindAll(this, 'onTouchMove', 'onTouchStart', 'onTouchEnd');
    this._controller = controller;
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
    this._start = event;
    this.initialScrollTop = $('html')[0].scrollTop;
    const currentBlockView = Views.currentBlockView;
    this.initialMeasure = currentBlockView.$el.onscreen();
  }

  onTouchMove(event) {
    event.preventDefault();
    event.deltaY = (event.touches[0].clientY - this._start.touches[0].clientY);
    // check to see if section can be scrolled further here
    const currentBlockView = Views.currentBlockView;
    const blockHeight = currentBlockView.$el.height();
    const windowHeight = $(window).height();
    if (blockHeight <= windowHeight) return;
    if (event.deltaY < 0 && parseInt(this.initialMeasure.bottom) < 0) {
      State.canSnap = false;
      $('html')[0].scrollTop = this.initialScrollTop - _.max([event.deltaY, this.initialMeasure.bottom]);
      return;
    }
    if (event.deltaY > 0 && parseInt(this.initialMeasure.top) < 0) {
      State.canSnap = false;
      $('html')[0].scrollTop = this.initialScrollTop + _.max([-event.deltaY, this.initialMeasure.top]);
    }
  }

  onTouchEnd() {
    State.canSnap = true;
  }

}

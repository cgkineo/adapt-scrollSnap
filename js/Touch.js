import Views from './Views';

export default class Touch extends Backbone.Controller {

  initialize({ controller }) {
    _.bindAll(this, 'onTouchMove', 'onTouchStart', 'onTouchEnd');
    this.controller = controller;
  }

  addEvents() {
    window.addEventListener('touchstart', this.onTouchStart, { passive: false, capture: false });
    window.addEventListener('touchmove', this.onTouchMove, { passive: false, capture: false });
    window.addEventListener('touchend', this.onTouchEnd, { passive: false, capture: false });
  }

  removeEvents() {
    window.removeEventListener('touchstart', this.onTouchStart, { passive: false, capture: false });
    window.removeEventListener('touchmove', this.onTouchMove, { passive: false, capture: false });
    window.removeEventListener('touchend', this.onTouchEnd, { passive: false, capture: false });
  }

  onTouchStart(event) {
    this.start = event;
    this.initialScrollTop = $('html')[0].scrollTop;
    const currentBlockView = Views.currentBlockView;
    this.initialMeasure = currentBlockView.$el.onscreen();
  }

  onTouchMove(event) {
    event.preventDefault();
    event.deltaY = (event.touches[0].clientY - this.start.touches[0].clientY);
    // check to see if section can be scrolled further here
    const currentBlockView = Views.currentBlockView;
    const blockHeight = currentBlockView.$el.height();
    const windowHeight = $(window).height();
    if (blockHeight <= windowHeight) return;
    if (event.deltaY < 0 && parseInt(this.initialMeasure.bottom) < 0) {
      this.controller.canSnap = false;
      $('html')[0].scrollTop = this.initialScrollTop - _.max([event.deltaY, this.initialMeasure.bottom]);
      return;
    }
    if (event.deltaY > 0 && parseInt(this.initialMeasure.top) < 0) {
      this.controller.canSnap = false;
      $('html')[0].scrollTop = this.initialScrollTop + _.max([-event.deltaY, this.initialMeasure.top]);
    }
  }

  onTouchEnd() {
    this.controller.canSnap = true;
  }

}

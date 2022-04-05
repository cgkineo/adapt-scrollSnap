import TWEEN from './TWEEN';
import WheelEvent from './WheelEvent';
import Views from './Views';
import 'libraries/hammer.min';

export default class ScrollSnap extends Backbone.Controller {

  initialize({ controller }) {
    _.bindAll(this, 'onWheel', 'animate');
    this.controller = controller;
    this.canSnap = false;
    this.direction = -1;
    this.level = 0;
    this.maxLevel = 200;
    this.wheelChainInterval = 200;
    requestAnimationFrame(this.animate);
  }

  animate(time) {
    requestAnimationFrame(this.animate);
    TWEEN.update(time);
  }

  addEvents() {
    window.addEventListener('wheel', this.onWheel);
  }

  removeEvents() {
    window.removeEventListener('wheel', this.onWheel);
  }

  onWheel(event) {
    this.wheeled(event);
    _.defer(() => {
      if (!this.canSnap || this.controller.isAnimating) return;
      this.canSnap = false;
      if (event.deltaY > 0) return this.controller.snapDown();
      this.controller.snapUp();
    });
  }

  wheeled(event) {
    const dir = event.deltaY < 0 ? 1 : -1;
    if (this.direction !== dir) {
      this.level = 0;
      this.direction = dir;
      this.tween?.stop();
    }
    let isStart = true;
    if (this.wheelChainTimeout) {
      clearTimeout(this.wheelChainTimeout);
      this.wheelChainTimeout = null;
      isStart = false;
    }
    this.wheelChainTimeout = setTimeout(this.wheelEnd.bind(this), this.wheelChainInterval);
    const wheelEvent = (new WheelEvent()).initFromEvent(event);
    wheelEvent.flip();
    wheelEvent.isStart = isStart;
    if (wheelEvent.isStart) {
      this.canSnap = false;
      this.tween?.stop();
    }
    this.consumeScroll(wheelEvent);
  }

  wheelEnd() {
    this.wheelChainTimeout = null;
    const wheelEvent = new WheelEvent(0, 0, 0, false, true);
    this.isWaitingForWheelEnd = false;
    this.consumeScroll(wheelEvent);
  }

  consumeScroll(event) {
    this.level += event.deltaY * this.direction;
    // check to see if section can be scrolled further here
    const currentBlockView = Views.currentBlockView;
    const blockHeight = currentBlockView.$el.height();
    const windowHeight = $(window).height();
    if (blockHeight > windowHeight) {
      const measure = currentBlockView.$el.onscreen();
      if (event.deltaY < 0 && parseInt(measure.bottom) < 0) {
        $('html')[0].scrollTop -= _.max([-40, measure.bottom]);
        this.isWaitingForWheelEnd = true;
        return;
      }
      if (event.deltaY > 0 && parseInt(measure.top) < 0) {
        $('html')[0].scrollTop += _.max([-40, measure.top]);
        this.isWaitingForWheelEnd = true;
        return;
      }
    }
    if (this.level >= this.maxLevel) {
      // the user has moved the mouse wheel sufficiently to gesture snapping up/down
      this.easeLevel(250); // TODO: check if this needs to have non-zero duration
      // prevent queued wheel events causing multiple snaps
      if (!this.isWaitingForWheelEnd) this.canSnap = true;
      this.isWaitingForWheelEnd = true;
    } else if (event.isEnd) {
      // wheel events have ceased and the content will have had chance to complete any scroll gradually decrement level
      this.easeLevel(1000);
    }
  }

  easeLevel(duration) {
    if (this.tween) this.tween.stop();
    this.tween = new TWEEN.Tween({ level: this.level })
      .to({ level: 0 }, duration)
      .easing(TWEEN.Easing.Quadratic.Out)
      .onUpdate(obj => {
        this.level = obj.level;
      })
      .onComplete(() => {
      })
      .start();
  }

}

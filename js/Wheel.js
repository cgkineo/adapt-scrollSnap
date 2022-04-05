import TWEEN from './TWEEN';
import WheelEvent from './WheelEvent';
import Views from './Views';
import 'libraries/hammer.min';

export default class Wheel extends Backbone.Controller {

  initialize({ controller }) {
    _.bindAll(this, 'onWheel', '_animate');
    this._controller = controller;
    this._canSnap = false;
    this._direction = -1;
    this._level = 0;
    this._maxLevel = 200;
    this._isWaitingForWheelEnd = false;
    this._wheelChainInterval = 200;
    this._wheelChainTimeout = null;
    requestAnimationFrame(this._animate);
  }

  addEvents() {
    window.addEventListener('wheel', this.onWheel);
  }

  removeEvents() {
    window.removeEventListener('wheel', this.onWheel);
  }

  _animate(time) {
    requestAnimationFrame(this._animate);
    TWEEN.update(time);
  }

  _wheeled(event) {
    const dir = event.deltaY < 0 ? 1 : -1;
    if (this._direction !== dir) {
      this._level = 0;
      this._direction = dir;
      this._tween?.stop();
    }
    let isStart = true;
    if (this._wheelChainTimeout) {
      clearTimeout(this._wheelChainTimeout);
      this._wheelChainTimeout = null;
      isStart = false;
    }
    this._wheelChainTimeout = setTimeout(this._wheelEnd.bind(this), this._wheelChainInterval);
    const wheelEvent = (new WheelEvent()).initFromEvent(event);
    wheelEvent.flip();
    wheelEvent.isStart = isStart;
    if (wheelEvent.isStart) {
      this._canSnap = false;
      this._tween?.stop();
    }
    this._consumeScroll(wheelEvent);
  }

  _wheelEnd() {
    this._wheelChainTimeout = null;
    const wheelEvent = new WheelEvent(0, 0, 0, false, true);
    this._isWaitingForWheelEnd = false;
    this._consumeScroll(wheelEvent);
  }

  _consumeScroll(event) {
    this._level += event.deltaY * this._direction;
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
    if (this._level >= this._maxLevel) {
      // the user has moved the mouse wheel sufficiently to gesture snapping up/down
      this._easeLevel(250); // TODO: check if this needs to have non-zero duration
      // prevent queued wheel events causing multiple snaps
      if (!this._isWaitingForWheelEnd) this._canSnap = true;
      this._isWaitingForWheelEnd = true;
    } else if (event.isEnd) {
      // wheel events have ceased and the content will have had chance to complete any scroll gradually decrement level
      this._easeLevel(1000);
    }
  }

  _easeLevel(duration) {
    if (this._tween) this._tween.stop();
    this._tween = new TWEEN.Tween({ level: this._level })
      .to({ level: 0 }, duration)
      .easing(TWEEN.Easing.Quadratic.Out)
      .onUpdate(obj => {
        this._level = obj.level;
      })
      .onComplete(() => {
      })
      .start();
  }

  onWheel(event) {
    this._wheeled(event);
    _.defer(() => {
      if (!this._canSnap || State.isAnimating) return;
      this._canSnap = false;
      if (event.deltaY > 0) return this._controller.snapDown();
      this._controller.snapUp();
    });
  }

}

import Adapt from 'core/js/adapt';
import Views from './Views';
import State from './State';
import Snap from './Snap';
import Scroll from './Scroll';
import Navigation from './Navigation';

export default class Wheel extends Backbone.Controller {

  initialize() {
    _.bindAll(this, 'onWheel');
    this.onEnd = _.debounce(this.onEnd.bind(this), 250);
    this._canSnap = false;
    this._direction = -1;
    this._lastAmount = 0;
    this._totalAmount = 0;
    this._peakAmount = 0;
    this._lastSnapAmount = 0;
    this._snapThresholdAmount = 50;
  }

  addEvents() {
    window.addEventListener('wheel', this.onWheel, { passive: false });
  }

  removeEvents() {
    window.removeEventListener('wheel', this.onWheel, { passive: false });
  }

  onWheel(event) {
    if (Adapt.notify.stack.length > 0 || State.isAnimating) return;
    const movement = this.getMovement(event);
    if (this.processLocalScroll(movement)) return;
    this.processSnap(movement);
  }

  getMovement(event) {
    const amount = Math.abs(event.deltaY);
    this._lastAmount = amount;
    return {
      deltaY: event.deltaY,
      amount
    };
  }

  processLocalScroll({ deltaY, amount }) {
    const currentBlockView = Views.currentBlockView;
    if (!Views.hasScrolling(currentBlockView)) return false;
    const offset = Scroll.offset;
    const blockMeasurement = currentBlockView.$el.onscreen();
    blockMeasurement.top += offset.top;
    blockMeasurement.bottom += offset.bottom;
    let finalScrollDelta = 0;
    const minScrollAmount = -40;
    if (-deltaY < 0 && parseInt(blockMeasurement.bottom) < 0) {
      finalScrollDelta = -Math.max(minScrollAmount, blockMeasurement.bottom);
    } else if (-deltaY > 0 && parseInt(blockMeasurement.top) < 0) {
      finalScrollDelta = Math.max(minScrollAmount, blockMeasurement.top);
    }
    // This section is to ignore insignificant wheel events after a snap
    // Insignificant events are smaller than the last amount or less than 10
    if (this._isIgnoreAfterEnd) {
      // If switching between the mouse and touchpad this._lastSnapAmount needs resetting
      if (this._lastSnapAmount === 100 && amount < 100) this._lastSnapAmount = 0;
      const isInsignificantAmount = (amount < 10 || amount < this._lastSnapAmount);
      if (isInsignificantAmount) return true;
      this._isIgnoreAfterEnd = false;
    }
    // No scroll amount
    if (!finalScrollDelta) {
      if (this._isLocalScrolling) return true;
      return false;
    }
    // Apply local scroll
    this._isLocalScrolling = true;
    $('html')[0].scrollTop += finalScrollDelta;
    this.onEnd(amount);
    return true;
  }

  processSnap({ deltaY, amount }) {
    /**
     * Remove the touchpad scroll events from after the peek of the scroll animation
     * - touchpad wheel events are more frequently, in smaller units and usually take a curve ramped up and then down
     * - mouse wheel events are usually a series of constant large units at a lower frequency
     */
    this._peakAmount = Math.max(this._peakAmount, amount);
    const isLessThanPeakAmount = (amount < this._peakAmount);
    if (isLessThanPeakAmount) return;
    const currentDirection = (deltaY < 0 ? 1 : -1);
    const hasDirectionChanged = (this._direction !== currentDirection);
    if (hasDirectionChanged) this.clearGesture();
    this._direction = currentDirection;
    this._totalAmount += amount;
    this.onEnd(amount);
  }

  /**
   * Clear the gesture details when the direction changes,  the local scroll has stopped, or the snap attempt has ended
   */
  clearGesture() {
    this._totalAmount = 0;
    this._direction = 0;
    this._lastAmount = 0;
    this._peakAmount = 0;
  }

  onEnd() {
    this._lastSnapAmount = this._lastAmount;
    if (this._isLocalScrolling) {
      this._isIgnoreAfterEnd = true;
      this._isLocalScrolling = false;
      this.clearGesture();
      Navigation.update();
      return;
    }
    const isDown = (this._direction < 0);
    const isSnap = (this._totalAmount >= this._snapThresholdAmount);
    this.clearGesture();
    if (!isSnap) return;
    this._isIgnoreAfterEnd = true;
    if (isDown) return Snap.down();
    Snap.up();
  }

}

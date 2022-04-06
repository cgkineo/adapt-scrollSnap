import Adapt from 'core/js/adapt';
import Wheel from './Wheel';
import Swipe from './Swipe';
import Keyboard from './Keyboard';
import Touch from './Touch';
import Device from './Device';
import Focus from './Focus';
import Page from './Page';
import Config from './Config';
import Block from './Block';
import State from './State';
import Scroll from './Scroll';
import './Trickle';
import './Visua11y';

class ScrollSnap extends Backbone.Controller {

  initialize() {
    this._page = new Page({ controller: this });
    this._device = new Device({ controller: this });
    this._block = new Block();
    this._wheel = new Wheel();
    this._swipe = new Swipe();
    this._keyboard = new Keyboard();
    this._touch = new Touch();
    this._focus = new Focus();
    State.canSnap = true;
    this.reset();
    this.listenToOnce(Adapt, 'adapt:start', this.onAdaptStart);
  }

  reset() {
    this._device.reset();
  }

  addEvents() {
    this.removeEvents();
    if (!Config.canUseScrollSnap) {
      Scroll.addEvents();
      return;
    }
    this._block.addEvents();
    this._wheel.addEvents();
    if (Config.isSwipeEnabled) this._swipe.addEvents();
    this._keyboard.addEvents();
    this._touch.addEvents();
    this._focus.addEvents();
  }

  removeEvents() {
    this._block.removeEvents();
    this._wheel.removeEvents();
    this._swipe.removeEvents();
    this._keyboard.removeEvents();
    this._touch.removeEvents();
    this._focus.removeEvents();
    Scroll.removeEvents();
  }

  onAdaptStart() {
    if (!Config.isEnabled) return;
    this._page.addEvents();
    this._device.addEvents();
  }

}

export default (Adapt.scrollsnap = new ScrollSnap());

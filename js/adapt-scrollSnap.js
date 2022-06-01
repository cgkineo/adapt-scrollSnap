import Adapt from 'core/js/adapt';
import Focus from './Focus';
import Popups from './Popups';
import Wheel from './Wheel';
import Swipe from './Swipe';
import Keyboard from './Keyboard';
import Touch from './Touch';
import Device from './Device';
import Page from './Page';
import Config from './Config';
import Block from './Block';
import State from './State';
import Snap from './Snap';
import Scroll from './Scroll';
import './Trickle';
import './Visua11y';
import Menu from './Menu';

class ScrollSnap extends Backbone.Controller {

  initialize() {
    this._page = new Page({ controller: this });
    this._device = new Device({ controller: this });
    this._block = new Block();
    this._wheel = new Wheel({ controller: this });
    this._swipe = new Swipe({ controller: this });
    this._keyboard = new Keyboard({ controller: this });
    this._touch = new Touch({ controller: this });
    this._focus = new Focus();
    State.canSnap = false;
    State.canScroll = false;
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
    this._focus.addEvents();
    if (Config.isSwipeEnabled) this._swipe.addEvents();
    this._keyboard.addEvents();
    this._touch.addEvents();
    this._popups.addEvents();
    this._menu.addEvents();
  }

  removeEvents() {
    this._block.removeEvents();
    this._wheel.removeEvents();
    this._focus.removeEvents();
    this._swipe.removeEvents();
    this._keyboard.removeEvents();
    this._touch.removeEvents();
    this._popups.removeEvents();
    this._menu.removeEvents();
    Scroll.removeEvents();
  }

  onAdaptStart() {
    this._popups = new Popups();
    this._menu = new Menu();
    if (!Config.isEnabled) return;
    this._page.addEvents();
    this._device.addEvents();
  }

  snapToBlock(model) {
    Snap.toId(model.get('_id'));
  }

}

export default (Adapt.scrollsnap = new ScrollSnap());

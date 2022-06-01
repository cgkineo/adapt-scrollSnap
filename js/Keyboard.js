import Snap from './Snap';
import State from './State';

export default class Keyboard extends Backbone.Controller {

  initialize({ controller }) {
    this._controller = controller;
    _.bindAll(this, 'onKeyDown');
  }

  addEvents() {
    window.addEventListener('keydown', this.onKeyDown);
  }

  removeEvents() {
    window.removeEventListener('keydown', this.onKeyDown);
  }

  onKeyDown(event) {
    if (!State.canScroll || !State.canSnap) return;
    const key = event.key || event.code || event.keyCode;
    // disable arrow keys to avoid conflict with screen readers
    switch (key) {
      case 'ArrowUp':
      case 38:
        if (!event.altKey) return;
        Snap.scroll({ direction: 'up' });
        break;
      case 'ArrowDown':
      case 40:
        if (!event.altKey) return;
        Snap.scroll({ direction: 'down' });
        break;
      case 'PageUp':
      case 33:
      // case 38:
        Snap.up();
        break;
      case 'PageDown':
      case 34:
      // case 40:
        Snap.down();
        break;
      case 'End':
      case 35:
        Snap.toLimit();
        break;
      case 'Home':
      case 36:
        Snap.toStart();
    }
  }

}

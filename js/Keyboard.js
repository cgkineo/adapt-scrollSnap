import Snap from './Snap';

export default class Keyboard extends Backbone.Controller {

  initialize() {
    _.bindAll(this, 'onKeyDown');
  }

  addEvents() {
    window.addEventListener('keydown', this.onKeyDown);
  }

  removeEvents() {
    window.removeEventListener('keydown', this.onKeyDown);
  }

  onKeyDown(event) {
    const key = event.key || event.code || event.keyCode;
    // disable arrow keys to avoid conflict with screen readers
    switch (key) {
      // case 'ArrowUp':
      case 'PageUp':
      case 33:
      // case 38:
        Snap.up();
        break;
      // case 'ArrowDown':
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

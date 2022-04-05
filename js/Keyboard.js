export default class Keyboard extends Backbone.Controller {

  initialize({ controller }) {
    _.bindAll(this, 'onKeyDown');
    this._controller = controller;
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
        this._controller.snapUp();
        break;
      // case 'ArrowDown':
      case 'PageDown':
      case 34:
      // case 40:
        this._controller.snapDown();
        break;
      case 'End':
      case 35:
        this._controller.snapToLimit();
        break;
      case 'Home':
      case 36:
        this._controller.snapToStart();
    }
  }

}
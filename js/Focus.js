import _ from 'underscore';
import Snap from './Snap';

/**
 * This section is expressly for keyboard tabbing only
 * TODO: finish Snap.scroll function for to property
 */
export default class Focus extends Backbone.Controller {

  initialize() {
    _.bindAll(this, 'onFocusIn');
  }

  addEvents() {
    $('body').on('focusin', this.onFocusIn);
  }

  removeEvents() {
    $('body').off('focusin', this.onFocusIn);
  }

  onFocusIn(e) {
    _.defer(() => Snap.scroll({ to: e.target }));
  }

}

import Views from './Views';

export default class Scroll extends Backbone.Controller {

  initialize({ controller }) {
    this.onScroll = _.debounce(this.onScroll, 250);
    _.bindAll(this, 'onScroll');
    this.controller = controller;
  }

  addEvents() {
    window.addEventListener('scroll', this.onScroll);
  }

  removeEvents() {
    window.removeEventListener('scroll', this.onScroll);
  }

  onScroll(event) {
    Views.setLocationId();
  }

}

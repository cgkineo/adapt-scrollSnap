import Views from './Views';
import Config from './Config';

class Scroll extends Backbone.Controller {

  initialize() {
    this.onScroll = _.debounce(this.onScroll.bind(this), 250);
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

  get offset() {
    return {
      top: (Config.canUseScrollSnap && Config.useNavigationOffset) ? -$('.nav').outerHeight() : 0,
      bottom: 0,
      left: 0,
      right: 0
    };
  }

}

export default new Scroll();

import Adapt from 'core/js/adapt';
import State from './State';
import Navigation from './Navigation';

class Trickle extends Backbone.Controller {

  initialize() {
    State.isTrickleKilled = false;
    this.listenTo(Adapt, {
      'trickle:kill': this.onTrickleKill
    });
  }

  onTrickleKill() {
    State.isTrickleKilled = true;
    Navigation.update();
  }

}

export default new Trickle();

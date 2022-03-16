import Adapt from 'core/js/adapt';
import Classes from './Classes';
import Config from './Config';
import Navigation from './Navigation';
import State from './State';
import Views from './Views';

export default class Device extends Backbone.Controller {

  initialize({ controller }) {
    _.bindAll(this, 'onFullscreenChange');
    this.controller = controller;
  }

  reset() {
    this.isFullscreenChange = false;
  }

  addEvents() {
    this.listenTo(Adapt, {
      'device:resize': this.onDeviceResize,
      'device:changed': this.onDeviceChanged
    });
    document.addEventListener('fullscreenchange', this.onFullscreenChange);
  }

  removeEvents() {
    document.removeEventListener('fullscreenchange', this.onFullscreenChange);
    this.stopListening(Adapt, {
      'device:resize': this.onDeviceResize,
      'device:changed': this.onDeviceChanged
    });
  }

  onFullscreenChange(e) {
    this.isFullscreenChange = true;
  }

  onDeviceResize(screenSize) {
    const isFullscreen = !!document.fullscreenElement;
    const isFullscreenResize = this.isFullscreenChange;
    this.isFullscreenChange = false;
    if (!Config.isScrollSnapSize || isFullscreen || isFullscreenResize) return;
    this.controller.scrollToId(State.locationId, 0, true);
  }

  onDeviceChanged(screenSize) {
    Classes.updateHtmlClasses();
    Navigation.update();
    if (!Config.isScrollSnapSize) Views.setLocationId();
    this.controller.addEvents();
    this.onDeviceResize(screenSize);
  }

}

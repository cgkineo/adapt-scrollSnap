import Adapt from 'core/js/adapt';

export default class Config extends Backbone.Controller {

  static get global() {
    return this.getModelConfig(Adapt.course);
  }

  static get isEnabled() {
    return this.global?._isEnabled;
  }

  static get canUseScrollSnap() {
    return Adapt.device.screenSize === 'large';
  }

  static get isSwipeEnabled() {
    return this.global._isSwipeEnabled ?? false;
  }

  static get useNavigationOffset() {
    return this.global._useNavigationOffet;
  }

  static getScrollDuration(directionType, config = this.global) {
    return config?._scrollDuration?.[directionType];
  }

  static getModelConfig(model) {
    return model?.get('_scrollSnap');
  }

}

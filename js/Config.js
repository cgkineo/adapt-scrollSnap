import Adapt from 'core/js/adapt';
import State, { USER_PREF_SCROLLSNAP } from './State';

export default class Config extends Backbone.Controller {

  static get global() {
    return this.getModelConfig(Adapt.course);
  }

  static get isEnabled() {
    return this.global?._isEnabled;
  }

  static get canUseScrollSnap() {
    return Adapt.device.screenSize === 'large' && State.userPreference === USER_PREF_SCROLLSNAP;
  }

  static get isSwipeEnabled() {
    return this.global._isSwipeEnabled ?? true;
  }

  static get useNavigationOffset() {
    return this.global._useNavigationOffset ?? true;
  }

  static getScrollDuration(directionType, config = this.global) {
    return config?._scrollDuration?.[directionType];
  }

  static getModelConfig(model) {
    return model?.get('_scrollSnap');
  }

  static log() {
    const args = _.toArray(arguments);
    console.log('%cscrollsnap ' + args.join(' '), 'background: #f2c75c; color: #003b49; border-radius:5px; padding:2px;');
  }

}

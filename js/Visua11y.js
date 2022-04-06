import Adapt from 'core/js/adapt';
import State, { USER_PREF_SCROLLSNAP, USER_PREF_TRADITIONAL } from './State';
import Views from './Views';

class Visua11y extends Backbone.Controller {

  initialize() {
    State.userPreference = USER_PREF_SCROLLSNAP;
    this.listenTo(Adapt, 'visua11y:changed', this.onVisua11yChanged);
  }

  onVisua11yChanged() {
    const pref = Adapt.visua11y?._noScrollSnap ?
      USER_PREF_TRADITIONAL :
      USER_PREF_SCROLLSNAP;
    State.userPreference = pref;
    Views.checkRenderType();
  }

}

export default new Visua11y();

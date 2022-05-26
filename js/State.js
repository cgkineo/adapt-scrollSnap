import Adapt from 'core/js/adapt';

export const USER_PREF_SCROLLSNAP = 1;
export const USER_PREF_TRADITIONAL = 2;

export default class State {

  static get currentModel() {
    return this._currentModel;
  }

  static set currentModel(model) {
    if (!model || this.currentModel === model) return;
    if (this.currentModel) this.previousModel = this.currentModel;
    this._currentModel = model;
    Adapt.trigger('scrollsnap:change:selected');
  }

  static get previousModel() {
    return this._previousModel;
  }

  static set previousModel(model) {
    this._previousModel = model;
  }

  static get locationId() {
    return this._locationId;
  }

  static set locationId(value) {
    this._locationId = value;
  }

  static get canSnap() {
    return this._canSnap;
  }

  static set canSnap(value) {
    this._canSnap = value;
  }

  static get isAnimating() {
    return this._isAnimating;
  }

  static set isAnimating(value) {
    this._isAnimating = value;
  }

  static get userPreference() {
    return this._userPreference;
  }

  static set userPreference(value) {
    this._userPreference = value;
  }

  static get isTrickleKilled() {
    return this._isTrickleKilled;
  }

  static set isTrickleKilled(value) {
    this._isTrickleKilled = value;
  }

  static get isTrickleEnabled() {
    return this._isTrickleEnabled && Adapt.parentView?.model?.findDescendantModels('component').some(component => component.get('_component') === 'trickle-button');
  }

  static set isTrickleEnabled(isEnabled) {
    this._isTrickleEnabled = isEnabled;
    if (!this._isTrickleEnabled) return;
    Adapt.blocks.forEach(block => {
      block.getChildren().where({ _component: 'trickle-button' }).forEach(trickleButton => {
        trickleButton.set('_isAvailable', isEnabled);
        // if disabled the block may be able to complete, so check it
        if (!isEnabled) {
          // synchronously check completion
          Adapt.checkingCompletion();
          block.checkCompletionStatusFor('_isComplete');
        }
      });
    });
  }

  static get isScrollSnapViewRendered() {
    return this._isScrollSnapViewRendered;
  }

  static set isScrollSnapViewRendered(value) {
    this._isScrollSnapViewRendered = value;
  }
}

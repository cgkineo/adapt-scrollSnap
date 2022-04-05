import Adapt from 'core/js/adapt';

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

}

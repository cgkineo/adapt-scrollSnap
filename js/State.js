import Adapt from 'core/js/adapt';

export default class State {

  static get currentModel() {
    return this._currentModel;
  }

  static get previousModel() {
    return this._previousModel;
  }

  static get locationId() {
    return this._locationId;
  }

  static set currentModel(value) {
    this._currentModel = value;
  }

  static set previousModel(value) {
    this._previousModel = value;
  }

  static set locationId(value) {
    this._locationId = value;
  }

  static setCurrentModel(model) {
    if (!model || this.currentModel === model) return;
    if (this.currentModel) this.previousModel = this.currentModel;
    this.currentModel = model;
    Adapt.trigger('scrollsnap:change:selected');
  }

}

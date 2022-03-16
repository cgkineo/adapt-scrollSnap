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

}

import Adapt from 'core/js/adapt';
import Config from './Config';
import State from './State';

export default class Models {

  static get pageModel() {
    if (!this.isPage(Adapt.parentView.model)) return null;
    return Adapt.parentView?.model;
  }

  static get articlesAndBlocks() {
    const pageModel = Adapt.parentView.model;
    return pageModel.getAllDescendantModels(true).filter(model => {
      return !this.isComponent(model) && model.get('_isAvailable');
    });
  }

  static get blockModels() {
    return this.articlesAndBlocks.filter(this.isBlock);
  }

  static isBlockStepLocked(block) {
    return !block.get('_isOptional') && !block.get('_isComplete');
  }

  static isModelAutoScrollOnInteractionComplete(model) {
    return Config.getModelConfig(model)?._autoScrollOnInteractionComplete;
  }

  static isPage(model) {
    return model?.get('_type') === 'page';
  }

  static isBlock(model) {
    return model?.get('_type') === 'block';
  }

  static isComponent(model) {
    return model?.get('_type') === 'component';
  }

  static getIsFirstModelIndex(index) {
    return index === 0;
  }

  static getIsLastModelIndex(index) {
    return index === this.lastModelIndex;
  }

  static get lastModelIndex() {
    return this.blockModels.length - 1;
  }

  static getCurrentModelIndex() {
    return this.blockModels.indexOf(State.currentModel);
  }

  static getPreviousModelIndex() {
    return this.blockModels.indexOf(State.previousModel);
  }

  static getDirectionType() {
    const previousIndex = this.getPreviousModelIndex();
    const currentIndex = this.getCurrentModelIndex();
    return (previousIndex > currentIndex) ? '_previous' : '_next';
  }

  static get stepLockIndex() {
    return this.blockModels.findIndex(this.isBlockStepLocked);
  }

  static get isCurrentStepLocked() {
    const index = this.getCurrentModelIndex();
    const block = this.blockModels[index];
    return this.isBlockStepLocked(block);
  }

  static updateLocking() {
    const stepLockIndex = this.stepLockIndex;
    this.blockModels.forEach((model, index) => {
      const isLocked = stepLockIndex >= 0 && (index > stepLockIndex);
      model.setOnChildren('_isLocked', isLocked);
    });
  }

  static shouldStopRendering(model) {
    const stepLockIndex = Models.articlesAndBlocks.findIndex(m => Models.isBlock(m) && Models.isBlockStepLocked(m));
    const childViewIndex = Models.articlesAndBlocks.indexOf(model);
    const shouldStopRendering = (stepLockIndex >= 0 && (childViewIndex > stepLockIndex));
    return shouldStopRendering;
  }

}

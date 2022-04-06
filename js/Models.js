import Adapt from 'core/js/adapt';
import Config from './Config';
import State from './State';

export default class Models {

  static get page() {
    const model = Adapt.parentView?.model;
    if (!this.isPage(model)) return null;
    return model;
  }

  static get articlesAndBlocks() {
    return this.page?.getAllDescendantModels(true).filter(model => {
      return !this.isComponent(model) && model.get('_isAvailable');
    });
  }

  static get blocks() {
    return this.articlesAndBlocks.filter(this.isBlock);
  }

  static get stepLockedBlockIndex() {
    const index = this.blocks.findIndex(this.isBlockStepLocked.bind(this));
    return State.isTrickleEnabled
      ? index - 1
      : index;
  }

  static isBlockStepLocked(block) {
    if (State.isTrickleKilled) return false;
    if (State.isTrickleEnabled) return block.get('_isLocked');
    return !block.get('_isOptional') && !block.get('_isComplete');
  }

  static isAutoScrollOnInteractionComplete(model) {
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

  static isFirstIndex(index) {
    return index === 0;
  }

  static isLastIndex(index) {
    return index === this.lastIndex;
  }

  static get lastIndex() {
    return this.blocks.length - 1;
  }

  static get currentIndex() {
    return this.blocks.indexOf(State.currentModel);
  }

  static get previousIndex() {
    return this.blocks.indexOf(State.previousModel);
  }

  static get directionType() {
    return (this.previousIndex > this.currentIndex) ? '_previous' : '_next';
  }

  static get isCurrentStepLocked() {
    const index = State.isTrickleEnabled
      ? this.currentIndex + 1
      : this.currentIndex;
    const block = this.blocks[index];
    return this.isBlockStepLocked(block);
  }

  static updateLocking() {
    if (State.isTrickleEnabled) return;
    const stepLockedBlockIndex = this.stepLockedBlockIndex;
    this.blocks.forEach((model, index) => {
      const isLocked = stepLockedBlockIndex >= 0 && (index > stepLockedBlockIndex);
      model.setOnChildren('_isLocked', isLocked);
    });
  }

  static shouldStopRendering(model) {
    if (State.isTrickleEnabled) {
      const articlesAndBlocks = this.articlesAndBlocks;
      const stepLockIndex = articlesAndBlocks.findIndex(m => m.get('_isLocked'));
      const childViewIndex = articlesAndBlocks.indexOf(model);
      return (stepLockIndex >= 0 && (childViewIndex >= stepLockIndex));
    }
    const articlesAndBlocks = this.articlesAndBlocks;
    const stepLockIndex = articlesAndBlocks.findIndex(m => this.isBlock(m) && this.isBlockStepLocked(m));
    const childViewIndex = articlesAndBlocks.indexOf(model);
    return (stepLockIndex >= 0 && (childViewIndex > stepLockIndex));
  }

}

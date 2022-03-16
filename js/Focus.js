import Models from './Models';
import State from './State';

export default class Focus extends Backbone.Controller {

  initialize({ controller }) {
    _.bindAll(this, 'onFocusIn');
    this.controller = controller;
  }

  addEvents() {
    $('body').on('focusin', this.onFocusIn);
  }

  removeEvents() {
    $('body').off('focusin', this.onFocusIn);
  }

  onFocusIn(e) {
    const $block = $(e.target).parents('.block');
    const blockId = $block.data('adapt-id');
    if (!blockId) return;
    const model = Models.blockModels.find(block => block.get('_id') === blockId);
    if (State.currentModel === model) return;
    Models.setCurrentModel(model);
    this.controller.scrollToId(blockId);
  }

}

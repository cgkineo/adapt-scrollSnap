import Models from './Models';
import Snap from './Snap';
import State from './State';

export default class Focus extends Backbone.Controller {

  initialize() {
    _.bindAll(this, 'onFocusIn');
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
    const model = Models.blocks.find(block => block.get('_id') === blockId);
    if (State.currentModel === model) return;
    State.currentModel = model;
    Snap.toId(blockId);
  }

}

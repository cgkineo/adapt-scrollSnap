import Adapt from 'core/js/adapt';
import Models from './Models';
import Navigation from './Navigation';
import Config from './Config';
import Views from './Views';

export default class Block extends Backbone.Controller {

  initialize({ controller }) {
    this._controller = controller;
  }

  addEvents() {
    this.listenTo(Adapt, {
      'view:addChild': this.onAddChildView,
      'view:childAdded': this.onChildAdded
    });
    this.listenTo(Models.page, 'bubble:change:_isComplete', this.onChildComplete);
  }

  removeEvents() {
    this.stopListening(Adapt, {
      'view:addChild': this.onAddChildView,
      'view:childAdded': this.onChildAdded
    });
    this.stopListening(Models.page, 'bubble:change:_isComplete', this.onChildComplete);
  }

  onAddChildView(e) {
    if (!Views.isScrollSnap(e.target)) return;
    const model = e.model;
    if (Models.isComponent(model)) return;
    if (!Models.shouldStopRendering(model)) return;
    e.stop();
  }

  /**
   * @todo Investigate why some branching views are calling this twice
   */
  onChildAdded(view) {
    if (!Views.isScrollSnap(view)) return;
    Models.updateLocking();
    const model = view.model;
    if (!Models.isBlock(model)) return;
    if (!Models.isAutoScrollOnInteractionComplete(model)) return;
    this.stopListening(model, 'change:_isInteractionComplete', this.onBlockInteractionComplete);
    this.listenTo(model, 'change:_isInteractionComplete', this.onBlockInteractionComplete);
  }

  onBlockInteractionComplete(model) {
    if (!Config.canUseScrollSnap || !model.get('_isInteractionComplete')) return;
    if (Adapt.notify.stack.length > 0) {
      this.listenToOnce(Adapt, 'notify:closed', () => this.onBlockInteractionComplete(model));
      return;
    }
    // defer as next child hasn't always been added by the time this triggers
    _.defer(() => this._controller.snapDown());
  }

  onChildComplete(e) {
    if (Adapt.notify.stack.length > 0) {
      this.listenToOnce(Adapt, 'notify:closed', () => this.onChildComplete(e));
      return;
    }
    Models.updateLocking();
    // defer as next child hasn't always been added by the time this triggers
    _.defer(async() => {
      const model = e.target;
      if (!Models.isBlock(model)) return;
      let stepLockBlock = Models.blocks.find(Models.isBlockStepLocked);
      if (!stepLockBlock) stepLockBlock = Models.blocks[this.lastIndex];
      if (stepLockBlock) {
        await Views.page.renderTo(stepLockBlock.get('_id'));
      }
      Navigation.update();
      Adapt.trigger('scrollsnap:change:locking');
    });
  }

}
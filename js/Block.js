import Adapt from 'core/js/adapt';
import Notify from 'core/js/notify';
import Models from './Models';
import Navigation from './Navigation';
import Config from './Config';
import Views from './Views';
import Snap from './Snap';
import State from './State';
import A11y from './A11y';
import _ from 'underscore';

export default class Block extends Backbone.Controller {

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
    if (!Views.isScrollSnapActive) return;
    const model = e.model;
    if (Models.isComponent(model)) return;
    if (!Models.shouldStopRendering(model)) return;
    e.stop();
  }

  onChildAdded(view, childView) {
    if (!Views.isScrollSnapActive) return;
    Models.updateLocking();
    const model = childView.model;
    if (!Models.isBlock(model)) return;
    if (Navigation.getModelConfig(model)?._isEnabled) childView.$el.addClass('has-navigation');
    Navigation.update();
    if (!Models.isAutoScrollOnInteractionComplete(model)) return;
    this.stopListening(model, 'change:_isInteractionComplete', this.onBlockInteractionComplete);
    this.listenTo(model, 'change:_isInteractionComplete', this.onBlockInteractionComplete);
  }

  onBlockInteractionComplete(model) {
    if (!Config.canUseScrollSnap || !model.get('_isInteractionComplete')) return;
    if (Notify.stack.length > 0) {
      this.listenToOnce(Adapt, 'notify:closed', () => this.onBlockInteractionComplete(model));
      return;
    }

    // defer as next child hasn't always been added by the time this triggers
    _.defer(async() => {
      await Adapt.parentView.whenReady();
      Snap.down()
    });
  }

  onChildComplete(e) {
    _.defer(() => Navigation.update());
    if (Notify.stack.length > 0) {
      this.listenToOnce(Adapt, 'notify:closed', () => this.onChildComplete(e));
      return;
    }
    const childModel = e.target;
    if (State.isTrickleEnabled) {
      const trickleButton = childModel.getChildren().findWhere({ _component: 'trickle-button' });
      trickleButton?.setCompletionStatus();
    }
    Models.updateLocking();
    // defer as next child hasn't always been added by the time this triggers
    _.defer(async() => {
      if (!Models.isBlock(childModel)) return;
      let targetBlockIndex = Models.stepLockedBlockIndex;
      if (targetBlockIndex < 0) targetBlockIndex = Models.lastIndex;
      const id = Models.blocks[targetBlockIndex].get('_id')
      Config.log('renderTo', id);
      await Views.page.renderTo(id);
      Navigation.update();
      A11y.hideOthers.immediate();
      Adapt.trigger('scrollsnap:change:locking');
    });
  }

}

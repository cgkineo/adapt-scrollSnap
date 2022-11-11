import NavigationView from './NavigationView';
import Models from './Models';
import Config from './Config';
import Views from './Views';
import State from './State';

export default class Navigation extends Backbone.Controller {

  static add({ Snap }) {
    const model = State.currentModel;
    const config = this.getModelConfig(model);
    this._view = new NavigationView({ model: new Backbone.Model(config), Snap });
    this.pause();
    Views.page.$el.find('.page__inner').append(this._view.$el);
  }

  static remove() {
    if (!this._view) return;
    this._view.remove();
    this._view = null;
  }

  static pause() {
    if (!this._view) return;
    this._view.model.set({
      _isPaused: true
    });
  }

  static play() {
    if (!this._view) return;
    this._view.model.set({
      _isPaused: false
    });
  }

  static show() {
    if (!this._view) return;
    this._view.model.set({
      _isVisible: true
    });
  }

  static hide() {
    if (!this._view) return;
    this._view.model.set({
      _isVisible: false
    });
  }

  static update() {
    if (!this._view) return;
    const model = State.currentModel;
    const config = this.getModelConfig(model);
    this._view.model.set(config);
  }

  static getModelConfig(model) {
    const config = $.extend(true, {}, Config.global?._navigation);
    const modelConfig = Config.getModelConfig(model)?._navigation;
    const isEnabled = modelConfig?._isEnabled ?? config?._isEnabled;
    const blockIndex = Models.blocks.indexOf(model);
    const view = Views.currentBlockView;
    // deep merge to prevent removal of nested object data
    const data = $.extend(true, config, modelConfig, {
      _id: model.get('_id'),
      _isEnabled: isEnabled,
      _isVisible: this._view?.model.get('_isVisible') ?? true,
      _isComplete: model?.get('_isComplete') ?? false,
      _isStepLocked: Models.stepLockedBlockIndex > -1 && Models.stepLockedBlockIndex <= blockIndex, // Models.isBlockStepLocked(model),
      _isFirst: Models.isFirstIndex(blockIndex),
      _isLast: Models.isLastIndex(blockIndex),
      _hasScrolling: Views.hasScrolling(view),
      _isScrollAtStart: Views.isScrollingAtStart(view),
      _isScrollAtEnd: Views.isScrollingAtEnd(view),
      _isScrollComplete: view?._isScrollComplete ?? false
    });
    return data;
  }

}

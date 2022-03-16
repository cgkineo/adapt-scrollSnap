import NavigationView from './NavigationView';
import Models from './Models';
import Config from './Config';
import Views from './Views';
import State from './State';

export default class Navigation extends Backbone.Controller {

  static remove() {
    this.navigationView.remove();
    this.navigationView = null;
  }

  static add() {
    const model = State.currentModel;
    const config = this.getModelNavigationConfig(model);
    this.navigationView = new NavigationView({ model: new Backbone.Model(config) });
    Views.pageView.$el.find('.page__inner').append(this.navigationView.$el);
  }

  static update() {
    if (!this.navigationView) return;
    const model = State.currentModel;
    const config = this.getModelNavigationConfig(model);
    this.navigationView.model.set(config);
  }

  static getModelNavigationConfig(model) {
    const config = $.extend(true, {}, Config.global?._navigation);
    const modelConfig = Config.getModelConfig(model)?._navigation;
    const isEnabled = modelConfig?._isEnabled ?? config?._isEnabled;
    const blockIndex = Models.blockModels.indexOf(model);
    // deep merge to prevent removal of nested object data
    const data = $.extend(true, config, modelConfig, {
      _id: model.get('_id'),
      _isEnabled: isEnabled,
      _isStepLocked: Models.isBlockStepLocked(model),
      _isFirst: Models.getIsFirstModelIndex(blockIndex),
      _isLast: Models.getIsLastModelIndex(blockIndex)
    });
    return data;
  }

}

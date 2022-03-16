import Adapt from 'core/js/adapt';
import Config from './Config';
import Models from './Models';
import State from './State';

export default class Views {

  static get pageView() {
    if (!Models.isPage(Adapt.parentView?.model)) return null;
    return Adapt.parentView;
  }

  static get blockViews() {
    function getDescendantViews(parentView) {
      const childViews = parentView.getChildViews();
      if (!childViews) return [];
      return childViews.flatMap(v => [v, ...getDescendantViews(v)]);
    }
    const allViews = getDescendantViews(this.pageView);
    return allViews.filter(view => Models.isBlock(view.model));
  }

  static get currentBlockView() {
    return this.blockViews.find(v => v.model === State.currentModel);
  }

  static isScrollSnap(view) {
    let model = view.model;
    if (!Models.isPage(model)) model = model.findAncestor('pages');
    const config = Config.getModelConfig(model);
    return config?._isEnabled;
  }

  static setLocationId() {
    let highestOnscreen = 0;
    let highestId;
    this.blockViews.forEach(view => {
      const id = view.model.get('_id');
      const measurements = view.$el.onscreen();
      if (!measurements.onscreen) return;
      if (measurements.percentInview < highestOnscreen) return;
      highestOnscreen = measurements.percentInview;
      highestId = id;
    });
    const model = Models.blockModels.find(model => model.get('_id') === highestId);
    if (!model) return;
    Models.setCurrentModel(model);
    State.locationId = highestId;
  }

}

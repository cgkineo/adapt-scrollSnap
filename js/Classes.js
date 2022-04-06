import Config from './Config';
import State from './State';

export default class Classes {

  static addHtmlClasses() {
    const $html = $('html');
    $html.addClass('scrollSnap');
    if (!Config.useNavigationOffset) $html.addClass('no-navigation-offset');
  }

  static removeHtmlClasses() {
    const currentModel = State.currentModel;
    const $html = $('html');
    $html.removeClass('scrollSnap no-navigation-offset');
    const currentClasses = Config.getModelConfig(currentModel)?._htmlClasses;
    if (currentClasses) $html.removeClass(currentClasses);
  }

  static updateHtmlClasses() {
    const previousModel = State.previousModel;
    const currentModel = State.currentModel;
    const previousClasses = Config.getModelConfig(previousModel)?._htmlClasses;
    const currentClasses = Config.getModelConfig(currentModel)?._htmlClasses;
    const $html = $('html');
    if (previousClasses) $html.removeClass(previousClasses);
    if (currentClasses) (Config.canUseScrollSnap) ? $html.addClass(currentClasses) : $html.removeClass(currentClasses);
  }

}

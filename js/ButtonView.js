import Adapt from 'core/js/adapt';

export default class ButtonView extends Backbone.View {

  className () {
    return 'scrollsnap';
  }

  events () {
    return {
      'click button': 'onClick'
    };
  }

  initialize() {
    this.$button = null;
    this.render();
  }

  render() {
    const template = Handlebars.templates.scrollButtonView;
    const data = this.model.toJSON();

    this.$el.html(template(data));

    this.$button = this.$el.find('button');

    return this;
  }

  show() {
    this.$button.removeAttr('disabled');
    this.$el.removeClass('is-hidden hide').addClass('is-visible show');
  }

  hide() {
    this.$el.removeClass('is-visible show').addClass('is-hidden hide');
    this.$button.attr('disabled', 'disabled');
  }

  onClick() {
    this.model.get('_isLast') ? Adapt.scrollsnap.first() : Adapt.scrollsnap.next();
  }

}

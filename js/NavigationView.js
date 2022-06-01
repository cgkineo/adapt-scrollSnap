import { templates } from 'core/js/reactHelpers';
import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'underscore';

export default class NavigationView extends Backbone.View {

  className() {
    return 'scrollsnap__nav';
  }

  events() {
    return {
      'click .js-btn-previous': 'onPreviousClick',
      'click .js-btn-next': 'onNextClick',
      'click .js-btn-scroll': 'onNextClick',
      'click .js-btn-last': 'onLastClick'
    };
  }

  initialize({ Snap }) {
    this.changed = _.debounce(this.changed, 50);
    this.Snap = Snap;
    this.listenTo(this.model, 'change', this.changed);
    this.render();
  }

  changed() {
    if (this.model.get('_isPaused')) return;
    const props = {
      ...this.model.toJSON()
    };
    ReactDOM.render(<templates.ScrollSnapNavigation { ...props } />, this.el);
  }

  render() {
    this.changed();
    return this;
  }

  onPreviousClick() {
    if (this.model.get('_isPaused')) return;
    if (this.Snap.scroll({ direction: 'up' })) return;
    this.Snap.previous();
  }

  onNextClick() {
    if (this.model.get('_isPaused')) return;
    if (this.Snap.scroll({ direction: 'down' })) return;
    this.Snap.next();
  }

  onLastClick() {
    if (this.model.get('_isPaused')) return;
    this.Snap.first();
  }

}

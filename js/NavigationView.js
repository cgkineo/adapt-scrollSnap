import Navigation from './navigation.jsx';
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
      'click .js-btn-last': 'onLastClick'
    };
  }

  initialize({ Snap }) {
    this.changed = _.debounce(this.changed, 250);
    this.Snap = Snap;
    this.listenTo(this.model, 'change', this.changed);
    this.render();
  }

  changed() {
    const props = {
      ...this.model.toJSON()
    };
    ReactDOM.render(<Navigation { ...props } />, this.el);
  }

  render() {
    this.changed();
    return this;
  }

  onPreviousClick() {
    this.Snap.previous();
  }

  onNextClick() {
    this.Snap.next();
  }

  onLastClick() {
    this.Snap.first();
  }

}

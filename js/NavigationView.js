import Navigation from './navigation.jsx';
import React from 'react';
import ReactDOM from 'react-dom';
import Adapt from 'core/js/adapt';

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

  initialize() {
    this.listenTo(this.model, 'all', this.changed);
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
    Adapt.scrollsnap.previous();
  }

  onNextClick() {
    Adapt.scrollsnap.next();
  }

  onLastClick() {
    Adapt.scrollsnap.first();
  }

}

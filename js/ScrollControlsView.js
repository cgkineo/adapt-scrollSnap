import Backbone from 'backbone';
import React from 'react';
import ReactDOM from 'react-dom';
import { templates } from 'core/js/reactHelpers';
import _ from 'underscore';

export default class ScrollControlsView extends Backbone.View {

  className() {
    return 'scrollsnap__controls';
  }

  initialize({ $parent, $scrollContainer }) {
    _.bindAll(this, 'onClick', 'onScroll', 'onResize');
    this.$parent = $parent;
    this.$scrollContainer = $scrollContainer;
    this.$scrollContainer.on({
      scroll: this.onScroll,
      resize: this.onResize
    });
    this.$parent.append(this.$el);
    this.render();
    this.onResize();
  }

  render() {
    const props = {
      onClick: this.onClick
    };
    ReactDOM.render(<templates.ScrollControls {...props} />, this.el);
  }

  onClick(event) {
    const direction = $(event.currentTarget).data('direction');
    this.$scrollContainer[0].scrollTop += direction === 'up' ? -80 : 80;
  }

  onScroll() {

  }

  onResize() {
    const windowHeight = $(window).height();
    const scrollingHeight = parseInt(this.$scrollContainer.find('> *').outerHeight() || this.$scrollContainer.outerHeight());
    const isFullWindow = (scrollingHeight > windowHeight);
    this.$el.toggleClass('is-full-window', isFullWindow);
  }

  remove() {
    this.$scrollContainer.off({
      scroll: this.onScroll,
      resize: this.onResize
    });
    super.remove();
  }

}

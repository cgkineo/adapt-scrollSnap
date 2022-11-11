import Backbone from 'backbone';
import React from 'react';
import ReactDOM from 'react-dom';
import { templates } from 'core/js/reactHelpers';
import _ from 'underscore';
import Config from './Config';

export default class ScrollControlsView extends Backbone.View {

  className() {
    return 'scrollsnap__controls';
  }

  initialize({ $parent, $scrollContainer }) {
    _.bindAll(this, 'onClick', 'onScroll', 'onResize');
    this.$parent = $parent;
    this.$scrollContainer = $scrollContainer;
    window.addEventListener('scroll', this.onScroll);
    this.$scrollContainer.on({
      scroll: this.onScroll,
      resize: this.onResize
    });
    this.$parent.append(this.$el);
    this.render();
    this.onResize();
  }

  render() {
    const view = this.$scrollContainer[0];
    const config = $.extend(true, {}, Config.global?._navigation);
    const props = {
      ...config,
      _hasScrolling: this.hasScrolling(view),
      _isScrollAtStart: this.isScrollingAtStart(view),
      _isScrollAtEnd: this.isScrollingAtEnd(view),
      onClick: this.onClick
    };
    ReactDOM.render(<templates.ScrollControls {...props} />, this.el);
  }

  hasScrolling(view) {
    if (!view) return false;
    const $el = view.$el ?? $(view);
    const hasScrolling = view.scrollHeight > view.clientHeight;
    const classname = 'has-scrolling';
    (hasScrolling) ? $el.addClass(classname) : $el.removeClass(classname);
    return hasScrolling;
  }

  isScrollingAtStart(view) {
    if (!this.hasScrolling(view)) return true;
    const isScrollTop = view.scrollTop === 0;
    return isScrollTop;
  }

  isScrollingAtEnd(view) {
    if (!this.hasScrolling(view)) return true;
    const isScrollBottom = view.scrollTop >= (view.scrollHeight - view.clientHeight);
    return isScrollBottom;
  }

  onClick(event) {
    const direction = $(event.currentTarget).data('direction');
    this.$scrollContainer[0].scrollTop += direction === 'up' ? -80 : 80;
    this.render();
  }

  onScroll() {
    this.render();
  }

  onResize() {
    const windowHeight = $(window).height();
    const scrollingHeight = parseInt(this.$scrollContainer.find('> *').outerHeight() || this.$scrollContainer.outerHeight());
    const isFullWindow = (scrollingHeight > windowHeight);
    this.$el.toggleClass('is-full-window', isFullWindow);
    this.render();
  }

  remove() {
    window.removeEventListener('scroll', this.onScroll);
    this.$scrollContainer.off({
      scroll: this.onScroll,
      resize: this.onResize
    });
    super.remove();
  }

}

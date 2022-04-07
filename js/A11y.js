import Views from './Views';

const cancellableDebounce = function (original, timeout) {
  let handle = null;
  const debounced = function(...args) {
    debounced.cancel();
    handle = setTimeout(() => original(...args), timeout);
  };
  debounced.cancel = function() {
    handle && clearTimeout(handle);
  };
  debounced.immediate = original;
  return debounced;
};

class A11y {

  static hideOthers(done) {
    const currentBlockView = Views.currentBlockView;
    const otherBlockViews = Views.blocks.filter(view => view !== currentBlockView);
    otherBlockViews.forEach(view => view.$el.addClass('is-scrollsnap-hidden').attr('aria-hidden', 'true'));
    currentBlockView.$el.removeClass('is-scrollsnap-hidden').removeAttr('aria-hidden');
    done?.();
  }

  static showAll() {
    this.hideOthers.cancel();
    const currentBlockView = Views.currentBlockView;
    Views.blocks.forEach(view => view.$el.removeClass('is-scrollsnap-hidden'));
    currentBlockView.$el.removeAttr('aria-hidden');
  }

}

A11y.hideOthers = cancellableDebounce(A11y.hideOthers.bind(A11y), 250);

export default A11y;

import React from 'react';

export default function NotifyScrollControls(props) {
  const {
    _isScrollAtStart,
    _isScrollAtEnd,
    _hasScrolling,
    _prompts
  } = props;

  const {
    _scroll
  } = _prompts;

  const isScrollingNotStart = (_scroll._isEnabled && _hasScrolling && !_isScrollAtStart);
  const isScrollingNotEnd = (_scroll._isEnabled && _hasScrolling && !_isScrollAtEnd);

  return (
    <div className='scrollsnap__controls-inner'>
      {(isScrollingNotStart) &&
      <button
        className='btn-icon scrollsnap__controls-btn scrollsnap__controls-btn-up'
        onClick={props.onClick}
        data-direction='up'
        aria-label={_scroll.previousLabel}
      >
        <div className='icon icon-controls-up' aria-hidden='true'></div>
      </button>
      }
      {(isScrollingNotEnd) &&
      <button
        className='btn-icon scrollsnap__controls-btn scrollsnap__controls-btn-down'
        onClick={props.onClick}
        data-direction='down'
        aria-label={_scroll.nextLabel}
      >
        <div className='icon icon-controls-down' aria-hidden='true'></div>
      </button>
      }
    </div>
  );

}

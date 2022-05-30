import React from 'react';
import { classes } from 'core/js/reactHelpers';

export default function Navigation(props) {

  const {
    _isComplete,
    _isVisible,
    _isEnabled,
    _isFirst,
    _isLast,
    _isScrollAtStart,
    _isScrollAtEnd,
    _isStepLocked,
    _hasScrolling,
    _isScrollComplete,
    _buttons,
    _prompts
  } = props;

  const {
    _previous,
    _next,
    _last
  } = _buttons;

  const {
    _scroll
  } = _prompts;

  if (!_isVisible || !_isEnabled) return null;

  const isScrolling = (_scroll._isEnabled && _hasScrolling && !_isScrollAtEnd);

  return (
    <div className={classes([
      'scrollsnap__nav-inner',
      _isFirst && 'is-first',
      _hasScrolling && 'has-scrolling',
      _isScrollComplete && 'is-scroll-complete',
      _isComplete && 'is-complete'
    ])}>

      {(!_isFirst || (_scroll._isEnabled && _hasScrolling && !_isScrollAtStart)) && _previous._isEnabled &&
      <button className={classes([
        'btn-text scrollsnap__nav-btn scrollsnap__nav-btn-previous js-btn-previous',
        _previous._classes
      ])}>
        <div className='icon icon-controls-up' aria-hidden='true'></div>
        <div className='scrollsnap__nav-btn-text'>
          {_previous.label}
        </div>
      </button>
      }

      {((!_isLast && _next._isEnabled) || isScrolling) &&
      <button
        className={classes([
          'btn-text scrollsnap__nav-btn scrollsnap__nav-btn-next js-btn-next',
          isScrolling ? _scroll._classes : _next._classes,
          !isScrolling && _isStepLocked && 'is-locked is-disabled'
        ])}
        disabled={!isScrolling && _isStepLocked}
        aria-live='assertive'
      >
        <div className='scrollsnap__nav-btn-text'>
          {isScrolling ? _scroll.label : _next.label}
        </div>
        <div className='icon icon-controls-down' aria-hidden='true'></div>
      </button>
      }

      {_isLast && _last._isEnabled &&
      <button className={classes([
        'btn-text scrollsnap__nav-btn scrollsnap__nav-btn-last js-btn-last',
        _last._classes
      ])}>
        <div className='icon icon-controls-up' aria-hidden='true'></div>
        <div className='scrollsnap__nav-btn-text'>
          {_last.label}
        </div>
      </button>
      }

    </div>
  );
}

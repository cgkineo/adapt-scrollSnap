import React from 'react';
import { classes } from 'core/js/reactHelpers';

export default function Navigation(props) {

  const {
    _isVisible,
    _isEnabled,
    _isPaused,
    _isComplete,
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

  const isScrollingNotEnd = (_scroll._isEnabled && _hasScrolling && !_isScrollAtEnd);
  const isScrollingNotStart = (_scroll._isEnabled && _hasScrolling && !_isScrollAtStart);

  return (
    <div className={classes([
      'scrollsnap__nav-inner',
      _isPaused && 'is-paused',
      _isFirst && 'is-first',
      _hasScrolling && 'has-scrolling',
      _isScrollComplete && 'is-scroll-complete',
      _isComplete && 'is-complete'
    ])}>

      {((!_isFirst && _previous._isEnabled) || isScrollingNotStart) &&
      <button
        className={classes([
          _previous.label ? 'btn-text' : 'btn-icon',
          'scrollsnap__nav-btn scrollsnap__nav-btn-previous js-btn-previous',
          isScrollingNotStart ? _scroll._previousClasses : _previous._classes
        ])}
        aria-live='assertive'
      >
        {_previous._icon &&
          <div
            className={classes([
              'icon',
              _previous._icon
            ])}
            aria-hidden='true'
          >
          </div>
        }
        <div className='scrollsnap__nav-btn-text'>
          {isScrollingNotStart ? _scroll.previousLabel : _previous.label}
        </div>
      </button>
      }

      {((!_isLast && _next._isEnabled) || isScrollingNotEnd) &&
      <button
        className={classes([
          _next.label ? 'btn-text' : 'btn-icon',
          'scrollsnap__nav-btn scrollsnap__nav-btn-next js-btn-next',
          isScrollingNotEnd ? _scroll._nextClasses : _next._classes,
          !isScrollingNotEnd && _isStepLocked && 'is-locked is-disabled'
        ])}
        disabled={!isScrollingNotEnd && _isStepLocked}
        aria-live='assertive'
      >
        <div className='scrollsnap__nav-btn-text'>
          {isScrollingNotEnd ? _scroll.nextLabel : _next.label}
        </div>
        {_next._icon &&
          <div
            className={classes([
              'icon',
              _next._icon
            ])}
            aria-hidden='true'
          >
          </div>
        }
      </button>
      }

      {_isLast && _last._isEnabled &&
      <button className={classes([
        _last.label ? 'btn-text' : 'btn-icon',
        'scrollsnap__nav-btn scrollsnap__nav-btn-last js-btn-last',
        _last._classes
      ])}>
        {_last._icon &&
          <div
            className={classes([
              'icon',
              _last._icon
            ])}
            aria-hidden='true'
          >
          </div>
        }
        <div className='scrollsnap__nav-btn-text'>
          {_last.label}
        </div>
      </button>
      }

    </div>
  );
}

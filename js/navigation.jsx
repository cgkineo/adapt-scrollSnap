import React from 'react';
import { classes } from 'core/js/reactHelpers';

export default function Navigation(props) {

  const {
    _isVisible,
    _isEnabled,
    _isFirst,
    _isLast,
    _isStepLocked,
    _buttons
  } = props;

  const _previous = _buttons._previous;
  const _next = _buttons._next;
  const _last = _buttons._last;

  if (!_isVisible || !_isEnabled) return null;

  return (
    <div className={classes([
      'scrollsnap__nav-btn-container',
      _isFirst && 'is-first'
    ])}>

      {!_isFirst && _previous._isEnabled &&
      <button className={classes([
        'btn-text scrollsnap__nav-btn scrollsnap__nav-btn-previous js-btn-previous',
        _previous._classes
      ])}>
        <div className='icon icon-controls-up'></div>
        <div className='scrollsnap__nav-btn-text'>
          {_previous.label}
        </div>
      </button>
      }

      {!_isLast && _next._isEnabled &&
      <button
        className={classes([
          'btn-text scrollsnap__nav-btn scrollsnap__nav-btn-next js-btn-next',
          _next._classes,
          _isStepLocked && 'is-locked is-disabled'
        ])}
        disabled={_isStepLocked}
      >
        <div className='scrollsnap__nav-btn-text'>
          {_next.label}
        </div>
        <div className='icon icon-controls-down'></div>
      </button>
      }

      {_isLast && _last._isEnabled &&
      <button className={classes([
        'btn-text scrollsnap__nav-btn scrollsnap__nav-btn-last js-btn-last',
        _last._classes
      ])}>
        <div className='icon icon-controls-up'></div>
        <div className='scrollsnap__nav-btn-text'>
          {_last.label}
        </div>
      </button>
      }

    </div>
  );
}

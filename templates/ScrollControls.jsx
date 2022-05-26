import React from 'react';

export default function NotifyScrollControls(props) {

  return (
    <div className='scrollsnap__controls-inner'>
      <button
        className='btn-icon scrollsnap__controls-btn scrollsnap__controls-btn-up'
        onClick={props.onClick}
        data-direction='up'
      >
        <div className='icon icon-controls-up' aria-hidden='true'></div>
      </button>
      <button
        className='btn-icon scrollsnap__controls-btn scrollsnap__controls-btn-down'
        onClick={props.onClick}
        data-direction='down'
      >
        <div className='icon icon-controls-down' aria-hidden='true'></div>
      </button>
    </div>
  );

}

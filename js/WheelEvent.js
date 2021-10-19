export default class WheelEvent {
  constructor (...args) {
    Object.assign(this, {
      deltaX: 0,
      deltaY: 0,
      deltaMode: 0,
      isStart: !1,
      isEnd: !1
    });
    this.initFromValues(...args);
  }

  initFromValues (e, t, i, n, s) {
    this.deltaX = e || 0;
    this.deltaY = t || 0;
    this.deltaMode = i || 0;
    this.isStart = !!n;
    this.isEnd = !!s;
    return this;
  }

  initFromEvent (e) {
    this.deltaX = e.deltaX;
    this.deltaY = e.deltaY;
    this.deltaMode = e.deltaMode;
    this.isStart = !!e.isStart;
    this.isEnd = !!e.isEnd;
    return this;
  }

  flip () {
    this.deltaX = -this.deltaX;
    this.deltaY = -this.deltaY;
    return this;
  }
}

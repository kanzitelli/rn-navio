import {TunnelEvent, TunnelEvents, TunnelListener, TunnelParams} from './types';

export class NavioTunnel {
  private events: TunnelEvents = {};

  on(event: TunnelEvent, listener: TunnelListener) {
    if (!(event in this.events)) {
      this.events[event] = [];
    }
    this.events[event]?.push(listener);
    return () => this.removeListener(event, listener);
  }

  removeListener(event: TunnelEvent, listener: TunnelListener) {
    if (!(event in this.events)) {
      return;
    }
    const idx = this.events[event]?.indexOf(listener);
    if (idx && idx > -1) {
      this.events[event]?.splice(idx, 1);
    }
    if (this.events[event]?.length === 0) {
      delete this.events[event];
    }
  }

  echo(event: TunnelEvent, params?: TunnelParams) {
    if (!(event in this.events)) {
      return;
    }
    this.events[event]?.forEach((listener: TunnelListener) => listener(params));
  }

  once(event: TunnelEvent, listener: TunnelListener) {
    const remove = this.on(event, (params?: TunnelParams) => {
      remove();
      listener(params);
    });
  }
}

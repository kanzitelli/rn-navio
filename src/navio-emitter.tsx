import {BottomTabNavigationOptions} from '@react-navigation/bottom-tabs';
import {BaseOptions} from './types';

// Navio Emitter for internal usage
type EmitterTypeListenersParams = {
  'tabs.updateOptions': {
    name: any;
    options: BaseOptions<BottomTabNavigationOptions>;
  };
};
type EmitterTypeListeners = {
  'tabs.updateOptions': EmitterListener<EmitterTypeListenersParams['tabs.updateOptions']>;
};
type EmitterListener<Params = any> = (params?: Params) => void;
type EmitterEventType = 'tabs.updateOptions';
export class NavioEmitter {
  protected events: Record<string, Array<EmitterListener>> = {};

  on<T extends EmitterEventType>(type: T, listener: EmitterTypeListeners[T]) {
    this.addListener(type, listener);
  }

  addListener<T extends EmitterEventType>(type: T, listener: EmitterTypeListeners[T]) {
    if (typeof listener !== 'function') throw new Error('Listener must be a function!');
    this.events[type] = this.events[type] ?? [];
    this.events[type].push(listener);
  }

  emit<T extends EmitterEventType>(type: T, params?: EmitterTypeListenersParams[T]) {
    if (this.events[type]) this.events[type].forEach(l => l(params));
  }
}

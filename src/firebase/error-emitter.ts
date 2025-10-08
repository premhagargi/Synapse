import { EventEmitter } from 'events';
import { FirestorePermissionError, FirestoreIndexError } from './errors';

type Events = {
  'permission-error': (error: FirestorePermissionError) => void;
  'index-error': (error: FirestoreIndexError) => void;
};

class TypedEventEmitter<
  TEvents extends Record<string, (...args: any[]) => void>
> extends EventEmitter {
  on<TEvent extends keyof TEvents>(
    event: TEvent,
    listener: TEvents[TEvent]
  ): this;
  on(event: string | symbol, listener: (...args: any[]) => void): this;
  on(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }

  off<TEvent extends keyof TEvents>(
    event: TEvent,
    listener: TEvents[TEvent]
  ): this;
  off(event: string | symbol, listener: (...args: any[]) => void): this;
  off(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.off(event, listener);
  }

  emit<TEvent extends keyof TEvents>(
    event: TEvent,
    ...args: Parameters<TEvents[TEvent]>
  ): boolean;
  emit(event: string | symbol, ...args: any[]): boolean;
  emit(event: string | symbol, ...args: any[]): boolean {
    return super.emit(event, ...args);
  }
}

export const errorEmitter = new TypedEventEmitter<Events>();

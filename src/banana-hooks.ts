type BananaEventMap = {
  'banana:click': { x: number; y: number; size: string; isGolden: boolean; isRotten: boolean };
  'banana:golden': { x: number; y: number };
  'banana:rotten': { x: number; y: number };
  'multiplier:start': { duration: number };
  'multiplier:end': Record<string, never>;
  'counter:personal': { value: number; delta: number };
  'rain:reverse': { duration: number };
  'rain:shrink-all': Record<string, never>;
  'rain:restore': Record<string, never>;
};

type BananaEvent = keyof BananaEventMap;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Handler<E extends BananaEvent> = (data: BananaEventMap[E]) => any;

class BananaHooks {
  private listeners = {} as { [E in BananaEvent]?: Handler<E>[] };

  on<E extends BananaEvent>(event: E, handler: Handler<E>): void {
    if (!this.listeners[event]) this.listeners[event] = [];
    (this.listeners[event] as Handler<E>[]).push(handler);
  }

  off<E extends BananaEvent>(event: E, handler: Handler<E>): void {
    const hs = this.listeners[event] as Handler<E>[] | undefined;
    if (hs) this.listeners[event] = hs.filter((h) => h !== handler) as typeof hs;
  }

  emit<E extends BananaEvent>(event: E, data: BananaEventMap[E]): void {
    const hs = this.listeners[event] as Handler<E>[] | undefined;
    if (hs) hs.forEach((h) => h(data));
  }
}

export const bananaHooks = new BananaHooks();
export type { BananaEventMap, BananaEvent };

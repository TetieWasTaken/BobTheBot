export type Event = {
  execute(...args: any): Promise<void> | void;
  name: string;
  once: boolean;
};

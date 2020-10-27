import { BreakLogEntry } from './breaklog-entry.model';

export class Terminal {
  id: number;
  alias: string;
  status: Status;
  openBreak: BreakLogEntry;
}

export enum Status {
  Online = 1,
  Serving,
  Break,
  Idle,
  Offline
}

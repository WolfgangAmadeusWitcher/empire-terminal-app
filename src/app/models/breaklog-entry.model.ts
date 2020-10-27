
export class BreakLogEntry{
  id: number;
  breakReason: string;
  breakStartTime: Date;
  breakEndTime: Date;
  terminalId: number;
  breakState: number;
}

export enum BreakState{
  Open,
  AllowedLimitExceeded,
  Closed
}

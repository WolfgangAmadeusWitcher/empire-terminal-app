import { TicketCategory } from './../models/ticket-category.model';
import { TerminalCategory } from './../models/terminal-category.model';
import { EmpireQueue } from './../models/empire-queue.model';
import { SignalRQueueService } from './../services/signal-r-queue.service';
import { HashTable } from '../utils/hash-table';
import { QueueService } from '../services/queue.service';
import { TicketCategoryService } from '../services/ticket-category.service';
import { SignalRService } from '../services/signal-r.service';
import { Utils } from '../utils/utils';
import { BreakLogEntry, BreakState } from '../models/breaklog-entry.model';
import { Terminal, Status } from '../models/terminal.model';
import { Component, OnInit } from '@angular/core';
import { TerminalService } from '../services/terminal.service';

import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';

@Component({
  selector: 'app-terminal',
  templateUrl: './terminal.component.html',
  styleUrls: ['./terminal.component.css'],
})
export class TerminalComponent implements OnInit {
  terminals = new HashTable<number, Terminal>();
  ticketCategories = new HashTable<number, TicketCategory>();
  terminalCategories: TerminalCategory[] = [];
  empireQueues: EmpireQueue[] = [];

  selectedTerminal: Terminal;
  breakText: string;
  lastBreakLogEntry: BreakLogEntry;

  idlePeriod = 120;
  timedOut = false;

  constructor(
    private terminalService: TerminalService,
    private ticketCategoryService: TicketCategoryService,
    private queueService: QueueService,
    private signalRService: SignalRService,
    private signalRQueueService: SignalRQueueService,
    private idle: Idle) {
    this.signalRQueueService.queueUpdated.subscribe((eq: EmpireQueue) => {
      const updateIndex = this.empireQueues.findIndex(
        (empQueue) => empQueue.id === eq.id
      );
      this.empireQueues[updateIndex] = eq;
    });

    this.signalRService.terminalUpdated.subscribe((tc) => {
      this.updateTerminal(tc);
    });

    this.signalRService.terminalCreated.subscribe((terminal: Terminal) =>
      this.terminals.put(terminal.id, terminal)
    );

    this.signalRService.terminalDeleted.subscribe((terminal: Terminal) =>
      this.deleteTerminal(terminal)
    );

    this.signalRService.breakLogEntryAdded.subscribe(
      (bl) => (this.lastBreakLogEntry = bl)
    );

    this.signalRService.terminalCategoryAdded.subscribe((tc) => {
      this.terminalCategories.push(tc);
    });

    this.signalRService.breakLogEntryUpdated.subscribe(
      (ble) => (this.lastBreakLogEntry = ble)
    );

    this.signalRService.terminalCategoryDeleted.subscribe((tc) => {
      this.deleteTerminalCategory(tc);
    });

    this.signalRService.ticketCategoryCreated.subscribe(
      (ticketCategory: TicketCategory) =>
        this.ticketCategories.put(ticketCategory.id, ticketCategory)
    );
    this.signalRService.ticketCategoryDeleted.subscribe(
      (ticketCategory: TicketCategory) =>
        this.ticketCategories.remove(ticketCategory.id)
    );
    this.signalRService.ticketCategoryUpdated.subscribe(
      (ticketCategory: TicketCategory) =>
        this.updateTicketCategory(ticketCategory)
    );
  }

  setupIdleTracker(): void {
    this.idle.setIdle(this.idlePeriod);
    this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);
    this.idle.setTimeout(false);
    this.idle.onIdleEnd.subscribe(() => {
      this.selectedTerminal.status = Status.Online;
      this.commitTerminalUpdate(this.selectedTerminal);
    });

    this.idle.onIdleStart.subscribe(() => {
      this.selectedTerminal.status = Status.Idle;
      this.commitTerminalUpdate(this.selectedTerminal);
    });

    this.idle.watch();
    this.timedOut = false;
  }

  ngOnInit(): void {
    this.loadAllTerminals();
    this.getAllTicketCategories();
    this.getAllTerminalCategories();
    this.getAllEmpireQueues();
    this.signalRQueueService.startLiveQueueServiceConnection();
    this.signalRQueueService.addQueueUpdatedEventListener();
    this.signalRQueueService.onDisconnectEventListener();
    this.signalRService.startConnection();
    this.signalRService.addTerminalUpdatedEventListener();
    this.signalRService.addTerminalCreatedEventListener();
    this.signalRService.addTerminalDeletedEventListener();
    this.signalRService.addTerminalCategoryCreatedEventListener();
    this.signalRService.addTerminalCategoryDeletedEventListener();
    this.signalRService.addTicketCategoryCreatedEventListener();
    this.signalRService.addTicketCategoryDeletedEventListener();
    this.signalRService.addTicketCategoryUpdatedEventListener();
    this.signalRService.onDisconnectEventListener();
  }

  getdiffBetweenBreakStartAndEnd(): string {
    return Utils.getDateDiff(
      this.lastBreakLogEntry.breakStartTime,
      this.lastBreakLogEntry.breakEndTime
    );
  }

  updateTerminal(updatedTerminal: Terminal): void {
    this.terminals.put(updatedTerminal.id, updatedTerminal);
    this.selectedTerminal = this.terminals.get(this.selectedTerminal?.id);
  }

  updateTicketCategory(ticketCategory: TicketCategory): void {
    this.ticketCategories.put(ticketCategory.id, ticketCategory);
  }

  commitTerminalUpdate(terminal: Terminal): void {
    this.terminalService.update(terminal).subscribe();
  }

  deleteTerminal(terminal: Terminal): void {
    this.terminals.remove(terminal.id);
    this.selectedTerminal = this.terminals.get(this.selectedTerminal.id);
  }

  deleteTerminalCategory(terminalCategory: TerminalCategory): void {
    const deleteIndex = this.terminalCategories.findIndex(
      (tc) =>
        tc.terminalId === terminalCategory.terminalId &&
        tc.ticketCategoryId === terminalCategory.ticketCategoryId
    );
    this.terminalCategories.splice(deleteIndex, 1);
  }

  loadAllTerminals(): void {
    this.terminalService.getAll().subscribe((terminalRecords) => {
      terminalRecords.map((terminal) =>
        this.terminals.put(terminal.id, terminal)
      );
    });
  }

  getAllTicketCategories(): void {
    this.ticketCategoryService.getAll().subscribe((ticketCategoryRecords) => {
      ticketCategoryRecords.map((ticketCategory) =>
        this.ticketCategories.put(ticketCategory.id, ticketCategory)
      );
    });
  }

  getAllTerminalCategories(): void {
    this.terminalService
      .getTerminalCategories()
      .subscribe((terminalCategoryRecords) => {
        terminalCategoryRecords.map((terminalCategory) =>
          this.terminalCategories.push(terminalCategory)
        );
      });
  }

  getAllEmpireQueues(): void {
    this.queueService.getEmpireQueues().subscribe((empQueueRecords) => {
      empQueueRecords.map((empireQueue) => this.empireQueues.push(empireQueue));
    });
  }

  getStatusText(statusCode: number): string {
    return Status[statusCode];
  }

  isOfflineTerminal(statusCode: number): boolean {
    return statusCode === Status.Offline;
  }

  onTerminalSelected($event): void {
    if (this.selectedTerminal === undefined) {
      this.setupIdleTracker();
    }
    const currentSelection = this.terminals.get(
      parseInt($event.target.value, 10)
    );
    this.signalRService.registerTerminalForConnection(
      currentSelection,
      this.selectedTerminal
    );
    this.selectedTerminal = currentSelection;
    this.lastBreakLogEntry = undefined;
  }

  isSuitableToTakeABreak(): boolean {
    return this.selectedTerminal?.status === Status.Online;
  }

  isSuitableToReturnFromBreak(): boolean {
    return this.selectedTerminal?.status === Status.Break;
  }

  isSuitableToEndService(): boolean {
    return this.selectedTerminal?.status === Status.Serving;
  }

  onTakingBreak(): void {
    this.signalRService.putTerminalIntoBreakMode(
      this.selectedTerminal,
      this.breakText
    );
    this.breakText = '';
  }

  isBreakClosed(): boolean {
    return this.lastBreakLogEntry?.breakState === BreakState.Closed;
  }

  onReturningFromBreak(): void {
    this.signalRService.getTerminalOutOfBreakState(
      this.selectedTerminal,
      this.lastBreakLogEntry
    );
  }

  getTicketCategoriesForOnlineTerminal(): TicketCategory[] {
    const ticketCategoryIds = this.terminalCategories
      .filter((tc) => tc.terminalId === this.selectedTerminal.id)
      .map((tc) => tc.ticketCategoryId);
    const selectedTerminalCategories: TicketCategory[] = [];
    ticketCategoryIds.forEach((ticketCategoryId) => {
      selectedTerminalCategories.push(
        this.ticketCategories.get(ticketCategoryId)
      );
    });
    return selectedTerminalCategories;
  }

  getNextCustomer(): void {
    this.queueService
      .getNext(this.selectedTerminal.id)
      .subscribe((ticket) => {});
  }

  getQueueByTicketCategoryId(ticketCategoryId: number): EmpireQueue {
    return this.empireQueues.find(
      (eq) => eq.ticketCategoryId === ticketCategoryId
    );
  }

  finalizeService(): void {
    this.queueService
      .endService(this.selectedTerminal.id)
      .subscribe((result) => {});
  }
}

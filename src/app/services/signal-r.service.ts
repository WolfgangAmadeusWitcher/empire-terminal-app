import { TicketCategory } from './../models/ticket-category.model';
import { TerminalCategory } from './../models/terminal-category.model';
import { BreakLogEntry } from './../models/breaklog-entry.model';
import { Injectable, EventEmitter, Output } from '@angular/core';
import { Terminal } from '../models/terminal.model';
import * as signalR from '@aspnet/signalr';

@Injectable({
  providedIn: 'root',
})
export class SignalRService {

  @Output() terminalUpdated = new EventEmitter<Terminal>();
  @Output() terminalCreated = new EventEmitter<Terminal>();
  @Output() terminalDeleted = new EventEmitter<Terminal>();

  @Output() breakLogEntryAdded = new EventEmitter<BreakLogEntry>();
  @Output() breakLogEntryUpdated = new EventEmitter<BreakLogEntry>();

  @Output() terminalCategoryAdded = new EventEmitter<TerminalCategory>();
  @Output() terminalCategoryDeleted = new EventEmitter<TerminalCategory>();

  @Output() ticketCategoryUpdated = new EventEmitter<TicketCategory>();
  @Output() ticketCategoryCreated = new EventEmitter<TicketCategory>();
  @Output() ticketCategoryDeleted = new EventEmitter<TicketCategory>();


  public data: Terminal;
  public terminalCategoryData: TerminalCategory;
  public breakLogEntry: BreakLogEntry;
  public ticketCategory: TicketCategory;
  private hubConnection: signalR.HubConnection;

  public startConnection(): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:5005/terminal')
      .build();
    console.log('Connection Starting...');
    this.hubConnection
      .start()
      .then(() => console.log('Connection started'))
      .catch((err) => console.log('Error while starting connection: ' + err));
  }

  onDisconnectEventListener(): void {
    this.hubConnection.onclose((error) => console.log(error));
  }

  registerTerminalForConnection(
    currentTerminal: Terminal,
    previousTerminal: Terminal
  ): void {
    this.hubConnection
      .invoke('RegisterTerminal', currentTerminal, previousTerminal)
      .catch((err) => console.error(err));
  }

  putTerminalIntoBreakMode(currentTerminal: Terminal, breakInfo: string): void {
    this.hubConnection
      .invoke('TakeBreak', currentTerminal, breakInfo).then(result => this.breakLogEntryAdded.emit(result))
      .catch((err) => console.error(err));
  }

  getTerminalOutOfBreakState(currentTerminal: Terminal, currentBreakLogEntry: BreakLogEntry): void {
    this.hubConnection
      .invoke('EndBreak', currentTerminal, currentBreakLogEntry)
      .then((breakLogResult) => this.breakLogEntryUpdated.emit(breakLogResult));
  }

  putTerminalIntoActiveMode(currentTerminal: Terminal): void {
    this.hubConnection
      .invoke('ActivateTerminal', currentTerminal)
      .catch((err) => console.error(err));
  }

  public addTerminalUpdatedEventListener(): void {
    this.hubConnection.on('terminal-updated-event', (data) => {
      console.log(data);
      this.data = data;
      this.terminalUpdated.emit(this.data);
    });
  }
  public addTerminalCreatedEventListener(): void {
    this.hubConnection.on('terminal-created-event', (data) => {
      this.data = data;
      this.terminalCreated.emit(this.data);
    });
  }

  public addTerminalDeletedEventListener(): void {
    this.hubConnection.on('terminal-deleted-event', (data) => {
      this.data = data;
      this.terminalDeleted.emit(this.data);
    });
  }

  public addTerminalCategoryCreatedEventListener(): void {
    this.hubConnection.on('terminal-category-created-event', (data) => {
      this.terminalCategoryData = data;
      this.terminalCategoryAdded.emit(this.terminalCategoryData);
    });
  }

  public addTerminalCategoryDeletedEventListener(): void {
    this.hubConnection.on('terminal-category-deleted-event', (data) => {
      this.terminalCategoryData = data;
      this.terminalCategoryDeleted.emit(this.terminalCategoryData);
    });
  }

  public addTicketCategoryCreatedEventListener(): void {
    this.hubConnection.on('ticket-category-created-event', (data) => {
      this.ticketCategory = data;
      this.ticketCategoryCreated.emit(this.ticketCategory);
    });
  }

  public addTicketCategoryUpdatedEventListener(): void {
    this.hubConnection.on('ticket-category-updated-event', (data) => {
      this.ticketCategory = data;
      this.ticketCategoryUpdated.emit(this.ticketCategory);
    });
  }

  public addTicketCategoryDeletedEventListener(): void {
    this.hubConnection.on('ticket-category-deleted-event', (data) => {
      this.ticketCategory = data;
      this.ticketCategoryDeleted.emit(this.ticketCategory);
    });
  }
}

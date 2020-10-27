import { EmpireQueue } from './../models/empire-queue.model';
import { EventEmitter, Injectable, Output } from '@angular/core';
import * as signalR from '@aspnet/signalr';

@Injectable({
  providedIn: 'root'
})
export class SignalRQueueService {

  @Output() queueUpdated = new EventEmitter<EmpireQueue>();
  private hubConnection: signalR.HubConnection;

  private queueData: EmpireQueue;
  constructor() { }

  public startLiveQueueServiceConnection(): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:5011/empire-queue')
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

  public addQueueUpdatedEventListener(): void {
    this.hubConnection.on('empire-queue-updated-event', (data) => {
      this.queueData = data;
      this.queueUpdated.emit(this.queueData);
    });
  }
}

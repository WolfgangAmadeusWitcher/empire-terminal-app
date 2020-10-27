import { EmpireQueue } from './../models/empire-queue.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QueueService {

  url = 'https://localhost:5011/Queue';
  private headers: HttpHeaders;
  constructor(private http: HttpClient) {
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  }

  getNext(id: number): Observable<number> {
    return this.http.post<number>(
      this.url + '/GetNext',
      id,
      {
        headers: this.headers,
      }
    );
  }

  endService(terminalId: number): Observable<number> {
    return this.http.post<number>(
      this.url + '/EndService',
      terminalId,
      {
        headers: this.headers,
      }
    );
  }

  getEmpireQueues(): Observable<EmpireQueue[]> {
    return this.http.get<EmpireQueue[]>(this.url + '/GetAll');
  }
}

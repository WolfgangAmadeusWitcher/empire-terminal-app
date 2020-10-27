import { Terminal } from './../models/terminal.model';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { TerminalCategory } from '../models/terminal-category.model';


@Injectable({
  providedIn: 'root'
})
export class TerminalService {

  url = 'https://localhost:5005/Terminal';
  private headers: HttpHeaders;
  constructor(private http: HttpClient) {
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  }

  getAll(): Observable<Terminal[]> {
    return this.http.get<Terminal[]>(this.url + '/GetAll');
  }

  getTerminalCategories(): Observable<TerminalCategory[]> {
    return this.http.get<TerminalCategory[]>('https://localhost:5005/Categories/GetAll');
  }

  update(terminal: Terminal): Observable<Terminal> {
    return this.http.post<Terminal>(
      this.url + '/Update',
      terminal,
      {
        headers: this.headers,
      }
    );
  }
}

import { TicketCategory } from './../models/ticket-category.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TicketCategoryService {

  url = 'https://localhost:5005/TicketCategory';
  private headers: HttpHeaders;
  constructor(private http: HttpClient) {
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  }

  getAll(): Observable<TicketCategory[]> {
    return this.http.get<TicketCategory[]>(this.url + '/GetAll');
  }
}

import { TicketCategory } from './ticket-category.model';

export class EmpireQueue{
  id: number;
  ticketCategoryId: number;
  activeWaitersCount: number;
}

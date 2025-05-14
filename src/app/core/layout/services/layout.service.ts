import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  private readonly _sidebarCollapsed = new BehaviorSubject<boolean>(
    this.loadInitialState()
  );

  sidebarCollapsed$ = this._sidebarCollapsed.asObservable();

  private loadInitialState(): boolean {
    const savedState = localStorage.getItem('sidebarCollapsed');
    return savedState !== null ? JSON.parse(savedState) : false;
  }

  toggleSidebar() {
    const newValue = !this._sidebarCollapsed.value;
    this._sidebarCollapsed.next(newValue);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newValue));
  }

  setSidebarState(collapsed: boolean) {
    this._sidebarCollapsed.next(collapsed);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(collapsed));
  }
  
}

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarStateService {
  private readonly _sidebarCollapsed = new BehaviorSubject<boolean>(false)
  public sidebarCollapsed$: Observable<boolean> = this._sidebarCollapsed.asObservable();

  constructor() {
    this.loadInitialState();
  }

   private loadInitialState(): void {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      this._sidebarCollapsed.next(savedState === 'true');
    }
  }

  toggleSidebarLocalStorage(): void {
    const newState = !this._sidebarCollapsed.value;
    this._sidebarCollapsed.next(newState);
    localStorage.setItem('sidebarCollapsed', String(newState));
  }

  setCollapsedLocalStorage(collapsed: boolean): void {
    this._sidebarCollapsed.next(collapsed);
    localStorage.setItem('sidebarCollapsed', String(collapsed));
  }
}

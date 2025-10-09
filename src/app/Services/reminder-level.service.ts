import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Network } from '../Entities/network';
import { ReminderLevel } from '../Entities/reminderLevel';

@Injectable({
  providedIn: 'root'
})
export class ReminderLevelService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.BACK_END_HOST_DEV}/reminder-levels`;
  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  private readonly _reminders = signal<ReminderLevel[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  public reminders = this._reminders.asReadonly();
  public loading = this._loading.asReadonly();
  public error = this._error.asReadonly();


  public loadInitialData(): Observable<ReminderLevel[]> {
    this._loading.set(true);
    return this.http.get<Network[]>(this.apiUrl).pipe(
      tap({
        next: (reminderLevels) => {
          this._reminders.set(reminderLevels);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to load reminder levels');
          console.error(err);
        }
      }),
      catchError(() => of([])),
      tap(() => this._loading.set(false))
    )
  }

  // CREATE
  addReminderLevel(reminderLevel: Omit<ReminderLevel, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<ReminderLevel> {
    return this.http.post<ReminderLevel>(this.apiUrl, reminderLevel, this.httpOptions).pipe(
      tap({
        next: (newReminderLevel) => {
          this._reminders.update(reminders => [...reminders, newReminderLevel]);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to add reminder levels');
          console.error('Error adding reminder levels:', err);
        }
      })
    )
  }

  // UPDATE
  updateReminderLevel(updateReminderLevel: ReminderLevel): Observable<ReminderLevel> {
    const url = `${this.apiUrl}/${updateReminderLevel.id}`;
    return this.http.put<Network>(url, updateReminderLevel, this.httpOptions).pipe(
      tap({
        next: (res) => {
          this._reminders.update(reminders => 
            reminders.map(rmd => rmd.id === res.id ? res : rmd)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to update reminder levels');
          console.error('Error updating reminder levels:', err);
        }
      })
    );
  }

  // DELETE
  deleteReminderLevel(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, this.httpOptions).pipe(
      tap({
        next: () => {
          this._reminders.update(reminders => 
            reminders.filter(rmd => rmd.id !== id)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to delete network');
          console.error('Error deleting network:', err);
        }
      })
    );
  }

  getReminderLevelById(id: number): Observable<ReminderLevel | undefined> {
    return this.http.get<ReminderLevel>(`${this.apiUrl}/${id}`, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch reminder level by id');
        console.error(err);
        return of(undefined as unknown as ReminderLevel);
      })
    );
  }
}

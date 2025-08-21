import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { CostType } from '../Entities/costType';

@Injectable({
  providedIn: 'root'
})
export class CostTypeService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.BACK_END_HOST_DEV}/costtypes`;

  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };


  private readonly _costTypes = signal<CostType[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);


  public costTypes = this._costTypes.asReadonly();
  public loading = this._loading.asReadonly();
  public error = this._error.asReadonly();

  constructor() {
    this.loadInitialData();
  }

  public loadInitialData(): Observable<CostType[]> {
    this._loading.set(true);
    return this.http.get<CostType[]>(this.apiUrl, this.httpOptions).pipe(
      tap({
        next: (costTypes) => {
          this._costTypes.set(costTypes);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to load costTypes');
          console.error('Error loading costTypes:', err);
        }
      }),
      catchError(() => of([])),
      tap(() => this._loading.set(false))
    );
  }

  // CREATE
  addCostType(costType: Omit<CostType, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<CostType> {
    return this.http.post<CostType>(this.apiUrl, costType, this.httpOptions).pipe(
      tap({
        next: (newCostType) => {
          this._costTypes.update(costTypes => [...costTypes, newCostType]);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to add costType');
          console.error('Error adding costType:', err);
        },
        finalize: () => this._loading.set(false)
      })
    );
  }

  // UPDATE
  updateCostType(updatedCostType: CostType): Observable<CostType> {
    const url = `${this.apiUrl}/${updatedCostType.id}`;
    return this.http.put<CostType>(url, updatedCostType, this.httpOptions).pipe(
      tap({
        next: (res) => {
          this._costTypes.update(costTypes =>
            costTypes.map(t => t.id === res.id ? res : t)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to update costType');
          console.error('Error updating costType:', err);
        }
      })
    );
  }

  // DELETE
  deleteCostType(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, this.httpOptions).pipe(
      tap({
        next: () => {
          this._costTypes.update(costTypes =>
            costTypes.filter(t => t.id !== id)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to delete costType');
          console.error('Error deleting costType:', err);
        }
      })
    );
  }

  // READ
  getAllCostTypes(): Observable<CostType[]> {
    return this.http.get<CostType[]>(this.apiUrl, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch costTypes');
        console.error('Error fetching costTypes:', err);
        return of([]);
      })
    );
  }

  getCostTypeById(id: number): Observable<CostType | undefined> {
    return this.getAllCostTypes().pipe(
      map(costTypes => costTypes.find(t => t.id === id))
    );
  }

  public refreshCostTypes(): void {
    this.loadInitialData();
  }
}
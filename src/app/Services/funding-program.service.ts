import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { FundingProgram } from '../Entities/fundingProgram';


@Injectable({
  providedIn: 'root'
})
export class FundingProgramService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.BACK_END_HOST_DEV}/funding-programs`;

  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };


  private readonly _fundingPrograms = signal<FundingProgram[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);


  public fundingPrograms = this._fundingPrograms.asReadonly();
  public loading = this._loading.asReadonly();
  public error = this._error.asReadonly();

  constructor() {
    this.loadInitialData();
  }

  public loadInitialData(): Observable<FundingProgram[]> {
    this._loading.set(true);
    return this.http.get<FundingProgram[]>(this.apiUrl, this.httpOptions).pipe(
      tap({
        next: (fundingPrograms) => {
          this._fundingPrograms.set(fundingPrograms);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to load funding programs');
          console.error('Error loading funding programs:', err);
        }
      }),
      catchError(() => of([])),
      tap(() => this._loading.set(false))
    );
  }

  // CREATE
  addFundingProgram(fundingProgram: Omit<FundingProgram, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<FundingProgram> {
    return this.http.post<FundingProgram>(this.apiUrl, fundingProgram, this.httpOptions).pipe(
      tap({
        next: (newFundingProgram) => {
          this._fundingPrograms.update(fundingPrograms => [...fundingPrograms, newFundingProgram]);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to add funding program');
          console.error('Error adding funding program:', err);
        },
        finalize: () => this._loading.set(false)
      })
    );
  }

  // UPDATE
  updateFundingProgram(updatedFundingProgram: FundingProgram): Observable<FundingProgram> {
    const url = `${this.apiUrl}/${updatedFundingProgram.id}`;
    return this.http.put<FundingProgram>(url, updatedFundingProgram, this.httpOptions).pipe(
      tap({
        next: (res) => {
          this._fundingPrograms.update(fundingPrograms =>
            fundingPrograms.map(t => t.id === res.id ? res : t)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to update funding program');
          console.error('Error updating funding program:', err);
        }
      })
    );
  }

  // DELETE
  deleteFundingProgram(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, this.httpOptions).pipe(
      tap({
        next: () => {
          this._fundingPrograms.update(fundingPrograms =>
            fundingPrograms.filter(t => t.id !== id)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to delete funding program');
          console.error('Error deleting funding program:', err);
        }
      })
    );
  }

  // READ
  getAllFundingPrograms(): Observable<FundingProgram[]> {
    return this.http.get<FundingProgram[]>(this.apiUrl, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch funding programs');
        console.error('Error fetching funding programs:', err);
        return of([]);
      })
    );
  }

  getFundingProgramById(id: number): Observable<FundingProgram | undefined> {
    return this.http.get<FundingProgram>(`${this.apiUrl}/${id}`, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch funding program by id');
        console.error(err);
        return of(undefined as unknown as FundingProgram);
      })
    );
  }

  public refreshFundingPrograms(): void {
    this.loadInitialData();
  }
}
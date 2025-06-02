import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { CompanyType } from '../Entities/companyType';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CompanyTypeService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.BACK_END_HOST_DEV}/company-types`;
  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  private readonly _companyTypes = signal<CompanyType[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  public companyTypes = this._companyTypes.asReadonly();
  public loading = this._loading.asReadonly();
  public error = this._error.asReadonly();

  constructor() { 
    this.loadInitialData();
  }

  private loadInitialData(): void {
    this._loading.set(true);
    this.http.get<CompanyType[]>(this.apiUrl).pipe(
      tap({
        next: (types) => {
          this._companyTypes.set(types);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to load company types');
          console.error(err);
        }
      }),
      catchError(() => of([])),
      tap(() => this._loading.set(false))
    ).subscribe();
  }

  // CREATE
  addCompanyType(companyType: Omit<CompanyType, 'id' | 'createdAt' | 'updatedAt'>): void {
    this.http.post<CompanyType>(this.apiUrl, companyType, this.httpOptions).pipe(
      tap({
        next: (newCompanyType) => {
          this._companyTypes.update(companyTypes => [...companyTypes, newCompanyType]);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to add CompanyType');
          console.error('Error adding CompanyType:', err);
        }
      })
    ).subscribe();
  }

  // UPDATE
  updateCompanyType(updatedCompanyType: CompanyType): void {
    const url = `${this.apiUrl}/${updatedCompanyType.id}`;
    this.http.put<CompanyType>(url, updatedCompanyType, this.httpOptions).pipe(
      tap({
        next: (res) => {
          this._companyTypes.update(companyTypes =>
            companyTypes.map(ct => ct.id === res.id ? res : ct)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to update company type');
          console.error('Error updating company type:', err);
        }
      })
    ).subscribe();
  }

  // DELETE
  deleteCompanyType(id: number): void {
    const url = `${this.apiUrl}/${id}`;
    this.http.delete<void>(url, this.httpOptions).pipe(
      tap({
        next: () => {
          this._companyTypes.update(companyTypes =>
            companyTypes.filter(ct => ct.id !== id)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to delete company type');
          console.error('Error deleting company type:', err);
        }
      })
    ).subscribe();
  }

  // READ
  getAllCompanyTypes(): Observable<CompanyType[]> {
    return this.http.get<CompanyType[]>(this.apiUrl, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch company types');
        console.error('Error fetching company types:', err);
        return of([]);
      })
    );
  }

  getCompanyTypeById(id: number): Observable<CompanyType | undefined> {
    return this.getAllCompanyTypes().pipe(
      map(types => types.find(t => t.id === id))
    );
  }
}

import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { CompanyType } from '../Entities/companyType';

@Injectable({
  providedIn: 'root'
})
export class CompanyTypeService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'assets/data/companyType.json';
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
    this.http.get<{ companyTypes: CompanyType[] }>(this.apiUrl).pipe(
      map(response => response.companyTypes),
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
    this._companyTypes.update(types =>
      types.map(t => t.id === updatedCompanyType.id ? updatedCompanyType : t)
    );
  }

  // DELETE
  deleteCompanyType(uuid: number): void {
    this._companyTypes.update(types =>
      types.filter(t => t.id !== uuid)
    );
  }

  // READ
  getAllCompanyTypes(): Observable<CompanyType[]> {
    return this.http.get<{ companyTypes: CompanyType[] }>(this.apiUrl).pipe(
      map(response => response.companyTypes),
      catchError(() => of([]))
    );
  }

  getCompanyTypeById(id: number): Observable<CompanyType | undefined> {
    return this.getAllCompanyTypes().pipe(
      map(types => types.find(t => t.id === id))
    );
  }
}

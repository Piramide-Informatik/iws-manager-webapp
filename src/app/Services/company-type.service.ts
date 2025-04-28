import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { CompanyType } from '../Entities/companyType';

@Injectable({
  providedIn: 'root'
})
export class CompanyTypeService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'assets/data/companyType.json';

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
  addCompanyType(companyType: Omit<CompanyType, 'uuid'>): void {
    const newCompanyType: CompanyType = {
      ...companyType,
      uuid: this.generateUUID()
    };
    this._companyTypes.update(types => [...types, newCompanyType]);
  }

  // UPDATE
  updateCompanyType(updatedCompanyType: CompanyType): void {
    this._companyTypes.update(types =>
      types.map(t => t.uuid === updatedCompanyType.uuid ? updatedCompanyType : t)
    );
  }

  // DELETE
  deleteCompanyType(uuid: string): void {
    this._companyTypes.update(types =>
      types.filter(t => t.uuid !== uuid)
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

  // Helper
  private generateUUID(): string {
    return crypto.randomUUID();
  }
}

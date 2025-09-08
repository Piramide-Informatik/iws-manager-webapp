import {Injectable, inject, signal} from '@angular/core';
import { IwsCommission } from '../Entities/iws-commission ';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class IwsCommissionService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.BACK_END_HOST_DEV}/iws-commissions`;

    private readonly httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
    };

    private readonly _iwsCommissions = signal<IwsCommission[]>([]);
    private readonly _loading = signal<boolean>(false);
    private readonly _error = signal<string | null>(null);


    public iwsCommissions = this._iwsCommissions.asReadonly();
    public loading = this._loading.asReadonly();
    public error = this._error.asReadonly();

    constructor() {
        this.loadInitialData()
    }

    public loadInitialData(): Observable<IwsCommission[]> {
        this._loading.set(true);
        return this.http.get<IwsCommission[]>(this.apiUrl, this.httpOptions).pipe(
            tap({
                next: (projectStatuses) => {
                    this._iwsCommissions.set(projectStatuses);
                    this._error.set(null);
                },
                error: (err) => {
                    this._error.set('Failed to load iwsCommissions');
                    console.error('Error loading iwsCommissions:', err);
                }
            }),
            catchError(() => of([])),
            tap(() => this._loading.set(false))
        );
    }

    // CREATE
    addIwsCommission(iwsCommission: Omit<IwsCommission, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<IwsCommission> {
        return this.http.post<IwsCommission>(this.apiUrl, iwsCommission, this.httpOptions).pipe(
            tap({
                next: (newIwsCommission) => {
                    this._iwsCommissions.update(iwsCommissions => [...iwsCommissions, newIwsCommission]);
                    this._error.set(null);
                },
                error: (err) => {
                    this._error.set('Failed to add IwsCommission');
                    console.error('Error adding IwsCommission:', err);
                },
                finalize: () => this._loading.set(false)
            })
        );
    }

    // UPDATE
    updateIwsCommission(updatedIwsCommission: IwsCommission): Observable<IwsCommission> {
        const url = `${this.apiUrl}/${updatedIwsCommission.id}`;
        return this.http.put<IwsCommission>(url, updatedIwsCommission, this.httpOptions).pipe(
            tap({
                next: (res) => {
                    this._iwsCommissions.update(iwsCommissions =>
                        iwsCommissions.map(c=> c.id === res.id ? res : c)
                    );
                    this._error.set(null);
                },
                error: (err) => {
                    this._error.set('Failed to update iwsCommission');
                    console.error('Error updating iwsCommission:', err);
                }
            })
        );
    }

    // DELETE
    deleteIwsCommission(id: number): Observable<void> {
        const url = `${this.apiUrl}/${id}`;
        return this.http.delete<void>(url, this.httpOptions).pipe(
            tap({
                next: () => {
                    this._iwsCommissions.update(iwsCommissions =>
                        iwsCommissions.filter(c => c.id !== id)
                    );
                    this._error.set(null);
                },
                error: (err) => {
                    this._error.set('Failed to delete iwsCommission');
                    console.error('Error deleting iwsCommission:', err);
                }
            })
        );
    }
    //READ
    getAllIwsCommissions(): Observable<IwsCommission[]> {
        return this.http.get<IwsCommission[]>(this.apiUrl, this.httpOptions).pipe(
            tap(() => this._error.set(null)),
            catchError(err => {
                this._error.set('Failed to fetch IwsCommission');
                console.error('Error fetching IwsCommission:', err);
                return of([]);
            })
        );
    }

    getIwsCommissionById(id: number): Observable<IwsCommission> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<IwsCommission>(url, this.httpOptions).pipe(
        tap(() => this._error.set(null)),
        catchError(err => {
        this._error.set('Failed to fetch IwsCommission');
        console.error('Error fetching IwsCommission:', err);
        return of(null as unknown as IwsCommission);
        })
    );
    }

    public refreshIwsCommission(): void {
        this.loadInitialData();
    }
}
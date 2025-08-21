import { Injectable, inject, signal } from "@angular/core";
import { ApprovalStatus } from "../Entities/approvalStatus";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, catchError, map, of, tap } from "rxjs";
import { environment } from "../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class ApprovalStatusService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.BACK_END_HOST_DEV}/approvalstatuses`;

    private readonly httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
    };

    // Signals for reactive state
    private readonly _approvalStatuses = signal<ApprovalStatus[]>([]);
    private readonly _loading = signal<boolean>(false);
    private readonly _error = signal<string | null>(null);

    // Expose signals as read-only
    public approvalStatuses = this._approvalStatuses.asReadonly();
    public loading = this._loading.asReadonly();
    public error = this._error.asReadonly();

    constructor() {
        this.loadInitialData().subscribe();
    }

    public loadInitialData(): Observable <ApprovalStatus[]> {
        this._loading.set(true);
        return this.http.get<ApprovalStatus[]>(this.apiUrl, this.httpOptions).pipe(
            tap({
                next: (statuses) => {
                    this._approvalStatuses.set(statuses);
                    this._error.set(null);
                },
                error: (err) => {
                    this._error.set('Failed to load approval statuses');
                    console.error('Error loading approval statuses:', err);
                }
            }),
            catchError(() => of([])),
            tap(() => this._loading.set(false))
        )
    }

    // CREATE
    addApprovalStatus(status: Omit<ApprovalStatus, 'id' | 'version' | 'createdAt' | 'updatedAt'>): Observable<ApprovalStatus> {
        return this.http.post<ApprovalStatus>(this.apiUrl, status, this.httpOptions).pipe(
            tap({
                next: (newStatus) => {
                    this._approvalStatuses.update(statuses => [...statuses, newStatus]);
                    this._error.set(null);
                },
                error: (err) => {
                    this._error.set('Failed to add approval status');
                    console.error('Error adding approval status:', err);
                }
            })
        )
    }

    //UPDATE
    updateApprovalStatus(status: ApprovalStatus): Observable<ApprovalStatus> {
        const url = `${this.apiUrl}/${status.id}`;
        return this.http.put<ApprovalStatus>(url, status, this.httpOptions).pipe(
            tap({
                next: (updatedStatus) => {
                    this._approvalStatuses.update(statuses => 
                        statuses.map(s => s.id === updatedStatus.id ? updatedStatus : s)
                    );
                    this._error.set(null);
                },
                error: (err) => {
                    this._error.set('Failed to update approval status');
                    console.error('Error updating approval status:', err);
                }
            })
        )
    }

    // DELETE
    deleteApprovalStatus(id: number): Observable<void> {
        const url = `${this.apiUrl}/${id}`;
        return this.http.delete<void>(url, this.httpOptions).pipe(
            tap({
                next: () => {
                    this._approvalStatuses.update(statuses =>
                        statuses.filter(s => s.id !== id)
                    );
                    this._error.set(null);
                },
                error: (err) => {
                    this._error.set('Failed to delete approval status');
                    console.error('Error deleting approval status:', err);
                }
            })
        );
    }

    // READ
    getAllApprovalStatuses(): Observable<ApprovalStatus[]> {
        return this.http.get<ApprovalStatus[]>(this.apiUrl, this.httpOptions).pipe(
            tap(() => this._error.set(null)),
            catchError(err => {
                this._error.set('Failed to fetch approval statuses');
                console.error('Error fetching approval statuses:', err);
                return of([]);
            })
        );
    }

    getApprovalStatusById (id: number): Observable<ApprovalStatus | undefined> {
        return this.getAllApprovalStatuses().pipe(
            map(statuses => statuses.find(status => status.id === id))
        );
    }

    public refreshApprovalStatuses(): void {
        this.loadInitialData();
    }
}
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, of, tap, throwError } from 'rxjs';
import { Customer } from '../Entities/customer';
import { environment } from '../../environments/environment';
import { ContactPerson } from '../Entities/contactPerson';

@Injectable({
    providedIn: 'root'
})
export class CustomerService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.BACK_END_HOST_DEV}/customers`;
    // Signals
    private readonly _customers = signal<Customer[]>([]);
    private readonly _loading = signal<boolean>(false);
    private readonly _error = signal<string | null>(null);

    private readonly _contacts = signal<ContactPerson[]>([]);
    private readonly _contactsLoading = signal<boolean>(false);
    private readonly _contactsError = signal<string | null>(null);

    public customers = this._customers.asReadonly();
    public loading = this._loading.asReadonly();
    public error = this._error.asReadonly();

    
    public contacts = this._contacts.asReadonly();
    public contactsLoading = this._contactsLoading.asReadonly();
    public contactsError = this._contactsError.asReadonly();

    private readonly httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        })
    };

    constructor() {
        this.loadInitialData();
    }

    private loadInitialData(): void {
        this._loading.set(true);
        this.http.get<Customer[]>(this.apiUrl, this.httpOptions).pipe(
            tap({
                next: (customers) => {
                    this._customers.set(customers);
                    this._error.set(null);
                },
                error: () => {
                    this._error.set('Failed to load customers');
                }
            }),
            catchError(() => of([])),
            tap(() => this._loading.set(false))
        ).subscribe();
    }

    // CREATE
    addCustomer(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'version'>): void {
        this.http.post<Customer>(this.apiUrl, customer, this.httpOptions).pipe(
            tap({
                next: (newCustomer) => {
                    this._customers.update(customers => [...customers, newCustomer]);
                    this._error.set(null);
                },
                error: (err) => {
                    this._error.set('Failed to add customer');
                    console.error('Error adding customer:', err);
                }
            })
        ).subscribe();
    }

    // READ
    getAllCustomers(): Observable<Customer[]> {
        return this.http.get<Customer[]>(this.apiUrl, this.httpOptions).pipe(
            tap(() => this._error.set(null)),
            catchError(err => {
                this._error.set('Failed to fetch customers');
                console.error('Error fetching customers:', err);
                return of([]);
            })
        );
    }

    getCustomerById(id: number): Observable<Customer | undefined> {
        return this.http.get<Customer>(`${this.apiUrl}/${id}`, this.httpOptions).pipe(
            tap(() => this._error.set(null)),
            catchError(err => {
                this._error.set('Failed to fetch customer by id');
                console.error(err);
                return of(undefined as unknown as Customer);
            })
        );
    }

    // UPDATE
    updateCustomer(updatedCustomer: Customer): void {
        const url = `${this.apiUrl}/${updatedCustomer.id}`;
        this.http.put<Customer>(url, updatedCustomer, this.httpOptions).pipe(
            tap({
                next: (res) => {
                    this._customers.update(customers =>
                        customers.map(c => c.id === res.id ? res : c)
                    );
                    this._error.set(null);
                },
                error: (err) => {
                    this._error.set('Failed to update customer');
                    console.error('Error updating customer:', err);
                }
            })
        ).subscribe();
    }

    // DELETE
    deleteCustomer(id: number): void {
        const url = `${this.apiUrl}/${id}`;
        this.http.delete<void>(url, this.httpOptions).pipe(
            tap({
                next: () => {
                    this._customers.update(customers =>
                        customers.filter(c => c.id !== id)
                    );
                    this._error.set(null);
                },
                error: (err) => {
                    this._error.set('Failed to delete customer');
                }
            })
        ).subscribe();
    }

    // ERROR HANDLING
    private handleError(error: HttpErrorResponse) {
        const errorMessage = error.error?.message ??
            error.statusText ??
            'Unknown server error';
        return throwError(() => new Error(errorMessage));
    }

    public refreshCustomers(): void {
        this.loadInitialData();
    }

    // GET CONTACTS BY CUSTOMER ID
    getCustomerContacts(customerId: number): Observable<ContactPerson[]> {
        this._contactsLoading.set(true);
        const url = `${this.apiUrl}/${customerId}/contacts`;
        
        return this.http.get<ContactPerson[]>(url, this.httpOptions).pipe(
            tap({
                next: (contacts) => {
                    this._contacts.set(contacts);
                    this._contactsError.set(null);
                },
                error: (err) => {
                    this._contactsError.set('Failed to load contacts');
                    console.error('Error loading contacts:', err);
                }
            }),
            catchError(err => {
                this._contactsError.set('Failed to fetch contacts');
                console.error('Error fetching contacts:', err);
                return of([]);
            }),
            tap(() => this._contactsLoading.set(false))
        );
    }

    /**
     * Cleans the state of the contacts
     */
    clearContacts(): void {
        this._contacts.set([]);
        this._contactsError.set(null);
    }
}
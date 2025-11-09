import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import { Customer } from '../Entities/customer';
import { environment } from '../../environments/environment';
import { ContactPerson } from '../Entities/contactPerson';

@Injectable({
    providedIn: 'root'
})
export class CustomerService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.BACK_END_HOST_DEV}/customers`;
    private readonly apiUrlbyContacts = `${environment.BACK_END_HOST_DEV}/contacts`;
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

    public loadInitialData(): Observable<Customer[]> {
        this._loading.set(true);
        return this.http.get<Customer[]>(this.apiUrl, this.httpOptions).pipe(
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
        );
    }

    // CREATE
    addCustomer(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<Customer> {
        return this.http.post<Customer>(this.apiUrl, customer, this.httpOptions).pipe(
            tap({
                next: (newCustomer) => {
                    this._customers.update(customers => [...customers, newCustomer]);
                    this._error.set(null);
                },
                error: (err) => {
                    this._error.set('Failed to add customer');
                    console.error('Error adding customer:', err);
                    return of(customer);
                }
            })
        );
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

    getNextCustomerNumber(): Observable<number | null> {
        return this.http.get<number>(`${this.apiUrl}/next-customer-no`, this.httpOptions).pipe(
            tap(() => this._error.set(null)),
            catchError(err => {
                this._error.set('Failed to fetch customer number');
                console.error(err);
                return of(null);
            })
        );
    }

    // UPDATE
    updateCustomer(updatedCustomer: Customer): Observable<Customer> {
        const url = `${this.apiUrl}/${updatedCustomer.id}`;
        return this.http.put<Customer>(url, updatedCustomer, this.httpOptions).pipe(
            tap({
                next: (res) => {
                    this._customers.update(customers =>
                        customers.map(c => c.id === res.id ? res : c)
                    );
                    this._error.set(null);
                },
                error: (err) => {
                    this._error.set('Failed to update customer');
                }
            })
        )
    }

    // DELETE
    deleteCustomer(id: number): Observable<void> {
        const url = `${this.apiUrl}/${id}`;
        return this.http.delete<void>(url, this.httpOptions).pipe(
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
        )
    }

    // GET CONTACTS BY CUSTOMER ID
    getCustomerContacts(customerId: number): Observable<ContactPerson[]> {
        this._contactsLoading.set(true);
        const url = `${this.apiUrl}/${customerId}/contacts`;

        return this.http.get<ContactPerson[]>(url, this.httpOptions).pipe(
            tap({
                next: (contacts) => {
                    this.handleResponseSuccessContacts(contacts);
                },
                error: (err) => {
                    this.handleResponseErrorContacts(err);
                }
            }),
            catchError(err => {
                this.handleCatchError(err);
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

    updateCustomerData(customers: Customer[]) {
        this._customers.set(customers)
    }

    /**
     * Fetches all contacts from the server and updates the internal contacts signal.
     * @returns Observable emitting array of ContactPerson or empty array if none found
     */
    getAllContacts(): Observable<ContactPerson[]> {
        this._contactsLoading.set(true);
        return this.http.get<ContactPerson[]>(`${this.apiUrlbyContacts}`, this.httpOptions).pipe(
            tap({
                next: (contacts) => {
                    this.handleResponseSuccessContacts(contacts);
                },
                error: (err) => {
                    this.handleResponseErrorContacts(err);
                }
            }),
            catchError(err => {
                this.handleCatchError(err);
                return of([]);
            }),
            tap(() => this._contactsLoading.set(false))
        );
    }

    private handleResponseSuccessContacts(contacts: ContactPerson[]): void {
        this._contacts.set(contacts);
        this._contactsError.set(null);
    }

    private handleResponseErrorContacts(error: HttpErrorResponse): void {
        this._contactsError.set('Failed to load contacts');
        console.error('Error loading contacts:', error);
    }

    private handleCatchError(error: HttpErrorResponse): void {
        this._contactsError.set('Failed to fetch contacts');
        console.error('Error fetching contacts:', error);
    }

    // POST -> /api/v1/customers/with-auto-customer-no
    addCustomerWithAutoNumber(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'customerno'>): Observable<Customer> {
    const createUrl = `${this.apiUrl}/with-auto-customer-no`;
    return this.http.post<Customer>(createUrl, customer, this.httpOptions).pipe(
        tap({
        next: (newCustomer) => {
            this._customers.update(customers => [newCustomer, ...customers]);
            this._error.set(null);
        },
        error: (err) => {
            this._error.set('Failed to create customer with auto number');
            console.error('Error creating customer with auto number:', err);
        },
        finalize: () => this._loading.set(false)
        })
    );
    }
}
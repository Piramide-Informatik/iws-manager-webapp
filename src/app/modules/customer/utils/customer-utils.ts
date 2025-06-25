import { EnvironmentInjector, inject, Injectable, runInInjectionContext } from '@angular/core';
import { Observable, catchError, filter, map, take, throwError } from 'rxjs';
import { CustomerService } from '../../../Services/customer.service';
import { Customer } from '../../../Entities/customer';
import { toObservable } from '@angular/core/rxjs-interop';
import { ContactPerson } from '../../../Entities/contactPerson';

@Injectable({ providedIn: 'root' })
/**
 * Utility class for customer-related business logic and operations.
 * Works with CustomerService's reactive signals while providing additional functionality.
 */
export class CustomerUtils {
    private readonly customerService = inject(CustomerService);
    private readonly injector = inject(EnvironmentInjector);

    /**
     * Gets all customers without any transformation
     * @returns Observable emitting the raw list of customers
     */
    getAllCustomers(): Observable<Customer[]> {
        return this.customerService.getAllCustomers().pipe(
            catchError(() => throwError(() => new Error('Failed to load customers')))
        );
    }

    /**
     * Gets a customer by ID with proper error handling
     * @param id - ID of the customer to retrieve
     * @returns Observable emitting the customer or undefined if not found
     */
    getCustomerById(id: number): Observable<Customer | undefined> {
        if (!id || id <= 0) {
            return throwError(() => new Error('Invalid customer ID'));
        }

        return this.customerService.getCustomerById(id).pipe(
            catchError(() => {
                return throwError(() => new Error('Failed to load customer'));
            })
        );
    }

    /**
     * Creates a new customer with validation
     * @param customer - Customer object to create (without id)
     * @returns Observable that completes when customer is created
     */
    createNewCustomer(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<Customer> {
        if (!customer.customername1?.trim()) {
            return throwError(() => new Error('Customer name cannot be empty'));
        }

        return this.customerService.addCustomer(customer);
    }

    /**
     * Checks if a customer exists by customer_no (case-insensitive comparison)
     * @param customer_no - Customer number to check
     * @returns Observable emitting boolean indicating existence
     */
    customerExists(customerno: number | string): Observable<boolean> {
        return this.customerService.getAllCustomers().pipe(
            map(customers => customers.some(
                c => c.customerno !== null && c.customerno?.toString().toLowerCase() === customerno.toString().toLowerCase()
            )),
            catchError(() => {
                return throwError(() => new Error('Failed to check customer existence'));
            })
        );
    }

    /**
     * Gets all customers sorted alphabetically by customer_name1
     * @returns Observable emitting sorted array of customers
     */
    getCustomersSortedByName(): Observable<Customer[]> {
        return this.customerService.getAllCustomers().pipe(
            map((customers: Customer[]) => {
                if (!Array.isArray(customers)) {
                    return [];
                }
                // Filtra los clientes con nombre válido y ordena alfabéticamente
                return customers
                    .filter(customer => !!customer.customername1 && customer.customername1.trim() !== '')
                    .sort((a, b) => (a.customername1 ?? '').localeCompare(b.customername1 ?? ''));
            }),
            catchError(() => throwError(() => new Error('Failed to sort customers')))
        );
    }

    /**
     * Refreshes customers data
     * @returns Observable that completes when refresh is done
     */
    refreshCustomers(): Observable<void> {
        return new Observable<void>(subscriber => {
            this.customerService.loadInitialData();
            subscriber.next();
            subscriber.complete();
        });
    }

    /**
     * Deletes a customer by ID and updates the internal customers signal.
     * @param id - ID of the customer to delete
     * @returns Observable that completes when the deletion is done
     */
    deleteCustomer(id: number): Observable<void> {
        return new Observable(observer => {
            this.customerService.deleteCustomer(id);

            setTimeout(() => {
                if (!this.customerService.error()) {
                    observer.next();
                    observer.complete();
                } else {
                    observer.error(this.customerService.error());
                }
            }, 100);
        });
    }

    /**
     * Updates a customer by ID and updates the internal customers signal.
     * @param customer - Customer object with updated data
     * @returns Observable that completes when the update is done
     */
    updateCustomer(customer: Customer): Observable<Customer> {
        if (!customer.id) {
            return throwError(() => new Error('Invalid customer data'));
        }

        return new Observable<Customer>(observer => {
            this.customerService.updateCustomer(customer);

            runInInjectionContext(this.injector, () => {
                const sub = this.waitForUpdatedCustomer(customer.id, observer);
                const errorSub = this.listenForUpdateErrors(observer);

                // Cleanup
                return () => {
                    sub.unsubscribe();
                    errorSub.unsubscribe();
                };
            });
        });
    }

    private waitForUpdatedCustomer(id: number, observer: any) {
        return toObservable(this.customerService.customers).pipe(
            map(customers => customers.find(c => c.id === id)),
            filter(updated => !!updated),
            take(1)
        ).subscribe({
            next: (updatedState) => {
                observer.next(updatedState);
                observer.complete();
            },
            error: (err) => observer.error(err)
        });
    }

    private listenForUpdateErrors(observer: any) {
        return toObservable(this.customerService.error).pipe(
            filter(error => !!error),
            take(1)
        ).subscribe({
            next: (err) => observer.error(err)
        });
    }
    /**
 * Gets all contacts for a specific customer by ID
 * @param customerId - ID of the customer to retrieve contacts for
 * @returns Observable emitting array of ContactPerson or empty array if none found
 */
    getContactsByCustomerId(customerId: number): Observable<ContactPerson[]> {
        if (!customerId || customerId <= 0) {
            return throwError(() => new Error('Invalid customer ID'));
        }

        return new Observable<ContactPerson[]>(subscriber => {
            const subscription = this.customerService.getCustomerContacts(customerId).subscribe({
                next: (contacts) => {
                    subscriber.next(contacts);
                    subscriber.complete();
                },
                error: (err) => {
                    subscriber.error(new Error('Failed to load contacts'));
                }
            });

            return () => subscription.unsubscribe();
        });
    }
}
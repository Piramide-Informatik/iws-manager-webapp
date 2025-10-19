import { inject, Injectable } from '@angular/core';
import { Observable, catchError, forkJoin, map, switchMap, take, throwError } from 'rxjs';
import { CustomerService } from '../../../Services/customer.service';
import { Customer } from '../../../Entities/customer';
import { ContactPerson } from '../../../Entities/contactPerson';
import { createNotFoundUpdateError, createUpdateConflictError } from '../../shared/utils/occ-error';
import { ContactUtils } from './contact-utils';

@Injectable({ providedIn: 'root' })
/**
 * Utility class for customer-related business logic and operations.
 * Works with CustomerService's reactive signals while providing additional functionality.
 */
export class CustomerUtils {
    private readonly customerService = inject(CustomerService);
    private readonly contactUtils = inject(ContactUtils);

    loadInitialData(): Observable<Customer[]> {
      return this.customerService.loadInitialData();
    }

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

    getNextCustomerNumber(): Observable<number | null> {
        return this.customerService.getNextCustomerNumber();
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
        if (!id || id <= 0) {
            return throwError(() => new Error('Invalid customer ID'));
        }

        return this.getContactsByCustomerId(id).pipe(
            switchMap((contacts: ContactPerson[]) => {
                if (!contacts || contacts.length === 0) {
                    return this.customerService.deleteCustomer(id);
                }

                return forkJoin(
                    contacts.map(contact => 
                        this.contactUtils.deleteContactPerson(contact.id)
                    )
                ).pipe(
                    switchMap(() => this.customerService.deleteCustomer(id))
                );
            }),
            catchError(err => throwError(() => err))
        );
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

        return this.customerService.getCustomerById(customer.id).pipe(
            take(1),
            switchMap((currentCustomer) => {
                if (!currentCustomer) {
                    return throwError(() => createNotFoundUpdateError('Customer'));
                }

                if (currentCustomer.version !== customer.version) {
                    return throwError(() => createUpdateConflictError('Customer'));
                }

                return this.customerService.updateCustomer(customer);
            })
        );
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

    /**
     * Gets all contacts from the DB.
     * @returns Observable emitting array of ContactPerson or empty array if none found
     */
    getAllContacts(): Observable<ContactPerson[]> {
        return this.customerService.getAllContacts().pipe(
            catchError(() => throwError(() => new Error('Failed to load contacts')))
        );
    }
}
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, forkJoin, map, of, switchMap, take, throwError } from 'rxjs';
import { NetworkService } from '../../../../../Services/network.service';
import { Network } from '../../../../../Entities/network';
import { ProjectUtils } from '../../../../projects/utils/project.utils';
import { InvoiceUtils } from '../../../../invoices/utils/invoice.utils';

/**
 * Utility class for network-related business logic and operations.
 * Works with networkService's reactive signals while providing additional functionality.
 */
@Injectable({ providedIn: 'root' })
export class NetowrkUtils {
  private readonly networkService = inject(NetworkService);
  private readonly projectUtils = inject(ProjectUtils);
  private readonly invoiceUtils = inject(InvoiceUtils);
  //faltan
  //private readonly chanceNetworkUtils = inject(ChanceNetworkUtils);
  //private readonly networkPartnerUtils = inject(NetworkPartnerUtils);

  loadInitialData(): Observable<Network[]> {
    return this.networkService.loadInitialData();
  }

  /**
     * Gets a network by ID with proper error handling
     * @param id - ID of the network to retrieve
     * @returns Observable emitting the network or undefined if not found
     */
  getNetworkById(id: number): Observable<Network | undefined> {
    if (!id || id <= 0) {
      return throwError(() => new Error('Invalid network ID'));
    }

    return this.networkService.getNetworkById(id).pipe(
      catchError(err => {
        console.error('Error fetching network:', err);
        return throwError(() => new Error('Failed to load network'));
      })
    );
  }

  /**
   * Creates a new network with validation
   * @param network - New network to be created
   * @returns Observable that completes when network is created
   */
  createNewNetwork(network: Omit<Network, 'id' | 'createdAt' | 'updatedAt'>): Observable<void> {

    return new Observable<void>(subscriber => {
      this.networkService.addNetwork(network);

      // Complete the observable after operation
      subscriber.next();
      subscriber.complete();
    });
  }

  /**
 * Deletes a network by ID and updates the internal signal.
 * @param id - ID of the network to delete
 * @returns Observable that completes when the deletion is done
 */
  deleteNetwork(id: number): Observable<void> {
    return this.checkNetworkUsage(id).pipe(
      switchMap(isUsed => {
        if (isUsed) {
          return throwError(() => new Error('Cannot delete register: it is in use by other entities'));
        }
        return this.networkService.deleteNetwork(id);
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  /**
   * Checks if a network is used by any project, invoice, chanceNetwork, networkPartner.
   * @param idNetwork - ID of the network to check
   * @returns Observable emitting boolean indicating usage
   */
  private checkNetworkUsage(idNetwork: number): Observable<boolean> {
    return forkJoin([
      this.projectUtils.getAllProjects().pipe(
        map(projects => projects.some(project => project.network?.id === idNetwork)),
        catchError(() => of(false))
      ),
      this.invoiceUtils.getAllInvoices().pipe(
        map(invoices => invoices.some(invoice => invoice.network?.id === idNetwork)),
        catchError(() => of(false))
      ),
    ] as const).pipe(
      map(([usedInProjects, usedInInvoices]) => usedInProjects || usedInInvoices)
    );
  }


  /**
 * Updates a network by ID and updates the internal titles signal.
 * @param network - network to update
 * @returns Observable that completes when the update is done
 */
  updateNetwork(network: Network): Observable<Network> {
    if (!network?.id) {
      return throwError(() => new Error('Invalid network data'));
    }

    return this.networkService.getNetworkById(network.id).pipe(
      take(1),
      switchMap((currentNetwork) => {
        if (!currentNetwork) {
          return throwError(() => new Error('Network not found'));
        }

        if (currentNetwork.version !== network.version) {
          return throwError(() => new Error('Conflict detected: network version mismatch'));
        }

        return this.networkService.updateNetwork(network);
      })
    );
  }
}
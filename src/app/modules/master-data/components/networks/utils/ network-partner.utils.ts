import { Injectable, inject } from '@angular/core';
import { Observable, catchError, switchMap, take, throwError } from 'rxjs';
import { Network } from '../../../../../Entities/network';
import { NetworkPartnerService } from '../../../../../Services/network-partner.service';
import { NetworkPartner } from '../../../../../Entities/network-partner';

/**
 * Utility class for network-partner-related business logic and operations.
 * Works with networkPartnerService's reactive signals while providing additional functionality.
 */
@Injectable({ providedIn: 'root' })
export class NetowrkPartnerUtils {
  private readonly networkPartnerService = inject(NetworkPartnerService);

  /**
     * Gets a network partner by Network ID with proper error handling
     * @param id - ID of the network
     * @returns Observable emitting the network partner or undefined if not found
     */
  getNetworkPartnerByNetworkId(id: number): Observable<NetworkPartner[] | undefined> {
    if (!id || id <= 0) {
      return throwError(() => new Error('Invalid network ID'));
    }

    return this.networkPartnerService.getNetworkPartnersByNetworkId(id).pipe(
      catchError(err => {
        console.error('Error fetching network partner:', err);
        return throwError(() => new Error('Failed to load network partner'));
      })
    );
  }

  /**
     * Gets a network partner by ID with proper error handling
     * @param id - ID of the network partner to retrieve
     * @returns Observable emitting the network partner or undefined if not found
     */
  getNetworkPartnerById(id: number): Observable<NetworkPartner | undefined> {
    if (!id || id <= 0) {
      return throwError(() => new Error('Invalid network partner ID'));
    }

    return this.networkPartnerService.getNetworkPartnerById(id).pipe(
      catchError(err => {
        console.error('Error fetching network partner:', err);
        return throwError(() => new Error('Failed to load network partner'));
      })
    );
  }

  /**
   * Creates a new network partner with validation
   * @param networkPartner - New network partner to be created
   * @returns Observable that completes when network partner is created
   */
  createNewNetworkPartner(networkPartner: Omit<NetworkPartner, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<NetworkPartner> {
    return this.networkPartnerService.addNetworkPartner(networkPartner);
  }

  /**
 * Deletes a network partner by ID and updates the internal signal.
 * @param id - ID of the network partner to delete
 * @returns Observable that completes when the deletion is done
 */
  deleteNetworkPartener(id: number): Observable<void> {
    return this.networkPartnerService.deleteNetworkPartner(id);
  }

  /**
 * Updates a network partner by ID and updates the internal titles signal.
 * @param networkPartner - network partner to update
 * @returns Observable that completes when the update is done
 */
  updateNetworkPartner(networkPartner: NetworkPartner): Observable<NetworkPartner> {
    if (!networkPartner?.id) {
      return throwError(() => new Error('Invalid network data'));
    }

    return this.networkPartnerService.getNetworkPartnerById(networkPartner.id).pipe(
      take(1),
      switchMap((currentNetworkPartner) => {
        if (!currentNetworkPartner) {
          return throwError(() => new Error('Network partner not found'));
        }

        if (currentNetworkPartner.version !== networkPartner.version) {
          return throwError(() => new Error('Conflict detected: network partner version mismatch'));
        }

        return this.networkPartnerService.updateNetworkPartner(networkPartner);
      })
    );
  }
}
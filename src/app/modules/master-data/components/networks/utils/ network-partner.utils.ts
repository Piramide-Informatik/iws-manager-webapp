import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, switchMap, take, throwError } from 'rxjs';
import { Network } from '../../../../../Entities/network';
import { NetworkPartnerService } from '../../../../../Services/network-partner.service';
import { NetworkPartner } from '../../../../../Entities/network-partner';
import { createNotFoundUpdateError, createUpdateConflictError } from '../../../../shared/utils/occ-error';

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
          return throwError(() => createNotFoundUpdateError('NetworkPartner'));
        }

        if (currentNetworkPartner.version !== networkPartner.version) {
          return throwError(() => createUpdateConflictError('NetworkPartner'));
        }

        return this.networkPartnerService.updateNetworkPartner(networkPartner);
      })
    );
  }
  /**
 * Checks if a partner number already exists for a given network
 * @param partnerno - Partner number to check
 * @param networkId - ID of the network
 * @param excludePartnerId - Optional ID of partner to exclude (for edit mode)
 * @returns Observable<boolean> - true if exists, false otherwise
 */
checkPartnernoExists(partnerno: number, networkId: number, excludePartnerId?: number): Observable<boolean> {
  return this.getNetworkPartnerByNetworkId(networkId).pipe(
    map(partners => {
      if (!partners) return false;
      
      return partners.some(partner => 
        partner.partnerno === partnerno && 
        partner.id !== excludePartnerId
      );
    }),
    catchError(() => of(false))
  );
}

/**
 * Checks if a partner (customer) already exists for a given network
 * @param partnerId - Customer ID to check
 * @param networkId - ID of the network
 * @param excludeNetworkPartnerId - Optional ID of network partner to exclude (for edit mode)
 * @returns Observable<boolean> - true if exists, false otherwise
 */
checkPartnerExists(partnerId: number, networkId: number, excludeNetworkPartnerId?: number): Observable<boolean> {
  return this.getNetworkPartnerByNetworkId(networkId).pipe(
    map(partners => {
      if (!partners) return false;
      
      return partners.some(networkPartner => 
        networkPartner.partner?.id === partnerId && 
        networkPartner.id !== excludeNetworkPartnerId
      );
    }),
    catchError(() => of(false))
  );
}
}
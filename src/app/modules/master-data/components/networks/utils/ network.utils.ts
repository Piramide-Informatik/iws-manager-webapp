import { Injectable, inject } from '@angular/core';
import { Observable, catchError, switchMap, take, throwError } from 'rxjs';
import { NetworkService } from '../../../../../Services/network.service';
import { Network } from '../../../../../Entities/network';
import { createNotFoundUpdateError, createUpdateConflictError } from '../../../../shared/utils/occ-error';

/**
 * Utility class for network-related business logic and operations.
 * Works with networkService's reactive signals while providing additional functionality.
 */
@Injectable({ providedIn: 'root' })
export class NetowrkUtils {
  private readonly networkService = inject(NetworkService);

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
  createNewNetwork(network: Omit<Network, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<Network> {
    return this.networkService.addNetwork(network);
  }

  /**
 * Deletes a network by ID and updates the internal signal.
 * @param id - ID of the network to delete
 * @returns Observable that completes when the deletion is done
 */
  deleteNetwork(id: number): Observable<void> {
    return this.networkService.deleteNetwork(id);
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
          return throwError(() => createNotFoundUpdateError('Network'));
        }

        if (currentNetwork.version !== network.version) {
          return throwError(() => createUpdateConflictError('Network'));
        }
        return this.networkService.updateNetwork(network);
      })
    );
  }

  networkExists(name: string): Observable<boolean> {
    if (!name?.trim()) {
      return throwError(() => new Error('Invalid network name'));
    }

    return this.networkService.getAllNetworks().pipe(
      take(1),
      // Normalizamos a minúsculas para evitar falsos negativos
      switchMap(networks =>
        [networks.some(n => n.name?.trim().toLowerCase() === name.trim().toLowerCase())]
      ),
      catchError(() => [false])
    );
  }
}
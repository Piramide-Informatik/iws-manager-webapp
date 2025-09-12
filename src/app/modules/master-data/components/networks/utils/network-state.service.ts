import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Network } from '../../../../../Entities/network';

@Injectable({ providedIn: 'root' })
export class NetworkStateService {
  private readonly editNetworkSource = new BehaviorSubject<Network | null>(null);
  currentNetwork$ = this.editNetworkSource.asObservable();

  setNetworkToEdit(network: Network | null): void {
    this.editNetworkSource.next(network);
  }

  clearNetwork() {
    this.editNetworkSource.next(null);
  }
}
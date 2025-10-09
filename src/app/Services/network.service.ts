import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Network } from '../Entities/network';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.BACK_END_HOST_DEV}/networks`;
  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  private readonly _networks = signal<Network[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  public networks = this._networks.asReadonly();
  public loading = this._loading.asReadonly();
  public error = this._error.asReadonly();

  constructor() { 
    this.loadInitialData();
  }

  public loadInitialData(): Observable<Network[]> {
    this._loading.set(true);
    return this.http.get<Network[]>(this.apiUrl).pipe(
      tap({
        next: (types) => {
          this._networks.set(types);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to load networks');
          console.error(err);
        }
      }),
      catchError(() => of([])),
      tap(() => this._loading.set(false))
    )
  }

  // CREATE
  addNetwork(network: Omit<Network, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<Network> {
    return this.http.post<Network>(this.apiUrl, network, this.httpOptions).pipe(
      tap({
        next: (newNetwork) => {
          this._networks.update(networks => [...networks, newNetwork]);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to add Network');
          console.error('Error adding Network:', err);
        }
      })
    )
  }

  // UPDATE
  updateNetwork(updatedNetwork: Network): Observable<Network> {
    const url = `${this.apiUrl}/${updatedNetwork.id}`;
    return this.http.put<Network>(url, updatedNetwork, this.httpOptions).pipe(
      tap({
        next: (res) => {
          this._networks.update(networks =>
            networks.map(nt => nt.id === res.id ? res : nt)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to update network');
          console.error('Error updating network:', err);
        }
      })
    );
  }

  // DELETE
  deleteNetwork(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, this.httpOptions).pipe(
      tap({
        next: () => {
          this._networks.update(networks =>
            networks.filter(nt => nt.id !== id)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to delete network');
          console.error('Error deleting network:', err);
        }
      })
    );
  }

  // READ
  getAllNetworks(): Observable<Network[]> {
    return this.http.get<Network[]>(this.apiUrl, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch networks');
        console.error('Error fetching networks:', err);
        return of([]);
      })
    );
  }

  getNetworkById(id: number): Observable<Network | undefined> {
    return this.http.get<Network>(`${this.apiUrl}/${id}`, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch network by id');
        console.error(err);
        return of(undefined as unknown as Network);
      })
    );
  }
}

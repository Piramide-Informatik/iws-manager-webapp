import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { NetworkPartner } from '../Entities/network-partner';

@Injectable({
  providedIn: 'root'
})
export class NetworkPartnerService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.BACK_END_HOST_DEV}/network-partners`;
  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  private readonly _networksPartner = signal<NetworkPartner[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  public networksPartner = this._networksPartner.asReadonly();
  public loading = this._loading.asReadonly();
  public error = this._error.asReadonly();

  public getNetworkPartnersByNetworkId(networkId: number): Observable<NetworkPartner[]> {
    const url = `${this.apiUrl}/by-network/${networkId}`;
    this._loading.set(true);
    return this.http.get<NetworkPartner[]>(url).pipe(
      tap({
        next: (types) => {
          this._networksPartner.set(types);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to load network partners');
          console.error(err);
        }
      }),
      catchError(() => of([])),
      tap(() => this._loading.set(false))
    )
  }

  // CREATE
  addNetworkPartner(networkPartner: Omit<NetworkPartner, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<NetworkPartner> {
    return this.http.post<NetworkPartner>(this.apiUrl, networkPartner, this.httpOptions).pipe(
      tap({
        next: (newNetworkPartner) => {
          this._networksPartner.update(networksPartner => [...networksPartner, newNetworkPartner]);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to add Network Partner');
          console.error('Error adding Network Partner:', err);
        }
      })
    )
  }

  // UPDATE
  updateNetworkPartner(updatedNetworkPartner: NetworkPartner): Observable<NetworkPartner> {
    const url = `${this.apiUrl}/${updatedNetworkPartner.id}`;
    return this.http.put<NetworkPartner>(url, updatedNetworkPartner, this.httpOptions).pipe(
      tap({
        next: (res) => {
          this._networksPartner.update(networksPartner =>
            networksPartner.map(ntp => ntp.id === res.id ? res : ntp)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to update network partner');
          console.error('Error updating network partner:', err);
        }
      })
    );
  }

  // DELETE
  deleteNetworkPartner(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, this.httpOptions).pipe(
      tap({
        next: () => {
          this._networksPartner.update(networksPartner =>
            networksPartner.filter(ntp => ntp.id !== id)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to delete network partner');
          console.error('Error deleting network partner:', err);
        }
      })
    );
  }

  // READ
  getNetworkPartnerById(networkNumberId: number): Observable<NetworkPartner | undefined>  {
    const url = `${this.apiUrl}/${networkNumberId}`;
    return this.http.get<NetworkPartner>(url, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch network by id');
        console.error(err);
        return of(undefined as unknown as NetworkPartner);
      })
    );
  }

  clearNetworkPartners() {
    this._networksPartner.set([]);
  }
}

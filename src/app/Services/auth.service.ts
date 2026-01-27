import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserPreferenceService } from './user-preferences.service';

export interface LoginResponse {
  username: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly AUTH_URL = environment.BACK_END_HOST_DEV_AUTH;
  private readonly USERNAME_KEY = 'auth_username';

  constructor(
    private readonly http: HttpClient,
    private readonly userPreferenceService: UserPreferenceService
  ) { }

  login(credentials: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.AUTH_URL}/login`,
      credentials,
      { withCredentials: true }
    ).pipe(
      tap(response => {
        localStorage.setItem(this.USERNAME_KEY, response.username);
      })
    );
  }

  logout(): Observable<any> {
    console.log('Logout');
    return this.http.post(
      `${this.AUTH_URL}/logout`,
      {},
      { withCredentials: true }
    ).pipe(
      tap(() => {
        localStorage.removeItem(this.USERNAME_KEY);
        this.userPreferenceService.clearFilters();
      })
    );
  }

  getCurrentUser(): Observable<LoginResponse> {
    return this.http.get<LoginResponse>(
      `${this.AUTH_URL}/me`,
      { withCredentials: true }
    );
  }

  getUsername(): string | null {
    return localStorage.getItem(this.USERNAME_KEY);
  }

  isLoggedIn(): Observable<boolean> {
    return new Observable<boolean>(observer => {
      this.getCurrentUser().subscribe({
        next: () => {
          observer.next(true);
          observer.complete();
        },
        error: () => {
          observer.next(false);
          observer.complete();
        }
      });
    });
  }
}

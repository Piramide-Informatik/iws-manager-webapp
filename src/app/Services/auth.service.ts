import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LoginResponse {
  token: string;
  type: string;
  username: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly AUTH_URL = environment.BACK_END_HOST_DEV_AUTH;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USERNAME_KEY = 'auth_username';

  constructor(private readonly http: HttpClient) {}

  login(credentials: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.AUTH_URL}/login`, credentials).pipe(
      tap(response => {
        this.setSession(response);
      })
    );
  }

  private setSession(authResult: LoginResponse): void {
    sessionStorage.setItem(this.TOKEN_KEY, authResult.token);
    sessionStorage.setItem(this.USERNAME_KEY, authResult.username);
  }

  logout(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.USERNAME_KEY);
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  getUsername(): string | null {
    return sessionStorage.getItem(this.USERNAME_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}

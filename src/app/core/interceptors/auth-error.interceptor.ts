import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { UserPreferenceService } from '../../Services/user-preferences.service';

export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);
    const userPreferenceService = inject(UserPreferenceService);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {

            if (error.status === 401) {
                // Clean login
                userPreferenceService.clearFilters();

                // Redirect to login
                router.navigate(['/login']);
            }

            return throwError(() => error);
        })
    );
};

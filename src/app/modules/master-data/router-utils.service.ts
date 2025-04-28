import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class RouterUtilsService {
  constructor(private readonly router: Router) {}

  reloadComponent(self: boolean, urlToNavigateTo?: string): Promise<boolean> {
    const url = self ? this.router.url : urlToNavigateTo;
    return this.router.navigateByUrl('/', { skipLocationChange: true })
      .then(() => this.router.navigate([`/${url}`]));
  }
}
import { Injectable, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class PageTitleService implements OnDestroy {

  private langSubscription: Subscription | null = null;

  constructor(
    private readonly translate: TranslateService,
    private readonly titleService: Title
  ) { }

  public setTranslatedTitle(translationKey: string): void {
    const setTitle = () => {
      const translated = this.translate.instant(translationKey);
      this.titleService.setTitle(translated);
    };

    setTitle();

    this.unsubscribe();

    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      setTitle();
    });
  }

  private unsubscribe(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
      this.langSubscription = null;
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }
}

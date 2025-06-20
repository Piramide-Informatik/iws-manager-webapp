import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-salutation',
  standalone: false,
  templateUrl: './salutation.component.html',
  styles: []
})
export class SalutationComponent {
  private langSubscription!: Subscription;

  constructor(private readonly translate: TranslateService, private readonly titleService: Title) { }
  ngOnInit(): void {
    this.updateTitle();
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.updateTitle();
    });
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  private updateTitle(): void {
    this.titleService.setTitle(
      this.translate.instant('PAGETITLE.SALUTATION')
    );
  }
}

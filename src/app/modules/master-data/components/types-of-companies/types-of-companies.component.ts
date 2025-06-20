import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-types-of-companies',
  standalone: false,
  templateUrl: './types-of-companies.component.html',
  styleUrl: './types-of-companies.component.scss'
})
export class TypesOfCompaniesComponent {
  private langSubscription!: Subscription;

  constructor(private readonly translate: TranslateService, private titleService: Title) { }
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
      this.translate.instant('PAGETITLE.TYPE_OF_COMPANIES')
    );
  }
}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-countries',
  standalone: false,
  templateUrl: './countries.component.html',
  styleUrl: './countries.component.scss'
})
export class CountriesComponent implements OnInit, OnDestroy {
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
      this.translate.instant('PAGETITLE.COUNTRIES')
    );
  }
}

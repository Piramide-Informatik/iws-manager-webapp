import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService, _ } from '@ngx-translate/core';
import { MasterDataService } from '../../master-data.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-employee-qualification',
  standalone: false,
  templateUrl: './employee-qualification.component.html',
  styles: ``
})
export class EmployeeQualificationComponent implements OnInit, OnDestroy {

  public employeesQualifications: any[] = [];
  public columsHeaderField: any[] = [];
  private langSubscription!: Subscription;

  constructor(
    private readonly translate: TranslateService,
    private readonly masterDataService: MasterDataService,
    private readonly router: Router
  ){}

  ngOnInit(): void {
    this.employeesQualifications = this.masterDataService.getEmployeeQualificationData();

    this.loadColHeaders();

    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeaders();
      this.reloadComponent(true);
    });
  }

  loadColHeaders(): void {
    this.columsHeaderField = [
      { field: 'qualification', styles: {'width': 'auto' }, header: this.translate.instant(_('EMPLOYEE_QUALIFICATION.LABEL.QUALIFICATION')) },
      { field: 'abbreviation', styles: {'width': 'auto'},  header: this.translate.instant(_('EMPLOYEE_QUALIFICATION.LABEL.ABBREVIATION')) },
    ];
  }

  reloadComponent(self: boolean, urlToNavigateTo?: string) {
    const url = self ? this.router.url : urlToNavigateTo;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([`/${url}`]).then(() => {
      })
    })
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }
}

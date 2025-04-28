import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService, _ } from '@ngx-translate/core';
import { MasterDataService } from '../../master-data.service';
import { Subscription } from 'rxjs';
import { RouterUtilsService } from '../../router-utils.service';

@Component({
  selector: 'app-employee-qualification',
  standalone: false,
  templateUrl: './employee-qualification.component.html',
  styles: ``
})
export class EmployeeQualificationComponent implements OnInit, OnDestroy {

  public employeesQualifications: any[] = [];
  public columsHeaderFieldEmployee: any[] = [];
  private langSubscription!: Subscription;

  constructor(
    private readonly translate: TranslateService,
    private readonly masterDataService: MasterDataService,
    private readonly routerUtils: RouterUtilsService
  ){}

  ngOnInit(): void {
    this.employeesQualifications = this.masterDataService.getEmployeeQualificationData();

    this.loadColHeaders();

    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeaders();
      this.routerUtils.reloadComponent(true);
    });
  }

  loadColHeaders(): void {
    this.columsHeaderFieldEmployee = [
      { field: 'qualification', styles: {'width': 'auto' }, header: this.translate.instant(_('EMPLOYEE_QUALIFICATION.LABEL.QUALIFICATION')) },
      { field: 'abbreviation', styles: {'width': 'auto'},  header: this.translate.instant(_('EMPLOYEE_QUALIFICATION.LABEL.ABBREVIATION')) },
    ];
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }
}

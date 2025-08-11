import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';

import { TranslateService, _,TranslatePipe, TranslateDirective } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { UserPreferenceService } from '../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../Entities/user-preference';
import { ProjectUtils } from '../../utils/project.utils';

interface Column {
  field: string,
  header: string,
  routerLink?: (row: any) => string,
  type?: string
  customClasses?: string[]
}

@Component({
  selector: 'app-projects-overview',
  standalone: false,
  providers: [MessageService, ConfirmationService, TranslatePipe, TranslateDirective],
  templateUrl: './projects-overview.component.html',
  styleUrl: './projects-overview.component.scss'
})
export class ProjectsOverviewComponent implements OnInit, OnDestroy {

  private readonly projectUtils = inject(ProjectUtils);

  filterIndex = 5;

  public cols!: Column[];

  public selectedColumns!: Column[];

  public selectedFilterColumns!: Column[];

  public projects!: any[];
  
  public customer!: number;

  private langSubscription!: Subscription;

  @ViewChild('dt2') dt2!: Table;

  userProjectPreferences: UserPreference = {};
  
  tableKey: string = 'Projects'
  
  dataKeys = ['projectLabel', 'projectName', 'fundingProgram', 'promoter', 'fundingLabel', 'startDate', 'endDate', 'authDate', 'fundingRate'];

  constructor(
  
    private activatedRoute: ActivatedRoute,
    private readonly translate: TranslateService,
    private readonly userPreferenceService: UserPreferenceService,
    public router:Router
  ) {
  }

  ngOnInit(): void {
    this.loadProjectColHeaders();
    this.selectedColumns = this.cols;
    this.userProjectPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadProjectColHeaders();
      this.selectedColumns = this.cols;
      this.userProjectPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    });
    this.activatedRoute.params.subscribe( params => {
      this.customer = params['id'];
      this.projectUtils.getAllProjectByCustomerId(this.customer).subscribe(projects => {
        this.projects = projects.reduce( (acc: any[], curr) => {
          acc.push({
            projectLabel: curr.projectLabel,
            projectName: curr.projectName,
            fundingProgram: curr.fundingProgram?.name ?? '',
            promoter: curr.promoter?.projectPromoter ?? '',
            fundingLabel: curr.fundingLabel,
            startDate: curr.startDate,
            endDate: curr.endDate,
            authDate: curr.authorizationDate,
            fundingRate: curr.fundingRate
          })
          return acc
        }, [])
      })
    })
  }

  onUserProjectPreferencesChanges(userProjectPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userProjectPreferences));
  }

  loadProjectColHeaders(): void {
    this.cols = [
      { field: 'projectLabel', header:  this.translate.instant(_('PROJECTS.TABLE.PROJECT_LABEL'))},
      { 
        field: 'projectName',
        routerLink: (row: any) => `./projects-detail/${row.projectName}`, 
        header: this.translate.instant(_('PROJECTS.TABLE.PROJECT_NAME'))},
      { field: 'fundingProgram', header: this.translate.instant(_('PROJECTS.TABLE.FUNDING_PROGRAM'))},
      { field: 'promoter', header: this.translate.instant(_('PROJECTS.TABLE.PROMOTER'))},
      { field: 'fundingLabel', header: this.translate.instant(_('PROJECTS.TABLE.FUNDING_LABEL'))},
      { field: 'startDate', type: 'date', header: this.translate.instant(_('PROJECTS.TABLE.START_DATE'))},
      { field: 'endDate', type: 'date',  header: this.translate.instant(_('PROJECTS.TABLE.END_DATE'))},
      { field: 'authDate', type: 'date',  header: this.translate.instant(_('PROJECTS.TABLE.AUTH_DATE'))},
      { field: 'fundingRate', customClasses: ['align-right'], type: 'double', header: this.translate.instant(_('PROJECTS.TABLE.FUNDING_RATE'))}
    ];
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  reloadComponent(self:boolean,urlToNavigateTo ?:string){
   const url=self ? this.router.url :urlToNavigateTo;
   this.router.navigateByUrl('/',{skipLocationChange:true}).then(()=>{
     this.router.navigate([`/${url}`]).then(()=>{
     })
   })
 }

  applyFilter(event: Event, field: string) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      this.dt2.filter(inputElement.value, field, 'contains');
    }
  }

}

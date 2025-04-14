import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Project } from '../../../../Entities/project';
import { ProjectService } from '../../services/project.service';

import { TranslateService, _,TranslatePipe, TranslateDirective } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

interface Column {
  field: string,
  header: string
}

@Component({
  selector: 'app-projects-overview',
  standalone: false,
  providers: [MessageService, ConfirmationService, Project, TranslatePipe, TranslateDirective],
  templateUrl: './projects-overview.component.html',
  styleUrl: './projects-overview.component.scss'
})
export class ProjectsOverviewComponent implements OnInit, OnDestroy {

  filterIndex = 5;

  public cols!: Column[];

  public selectedColumns!: Column[];

  public filterCols!: Column[];

  public selectedFilterColumns!: Column[];

  public projects!: Project[];
  
  public customer!: string;

  private langSubscription!: Subscription;

  @ViewChild('dt2') dt2!: Table;

  constructor(
  
    private activatedRoute: ActivatedRoute,
    private projectService: ProjectService,
    private translate: TranslateService,
    public router:Router
  ) {
  }

  ngOnInit(): void {
    this.loadColHeaders();
    this.selectedColumns = this.cols;
    this.selectedFilterColumns = this.filterCols;

    this.customer = 'Joe Doe';

    this.projects = this.projectService.list();

    this.selectedColumns = this.cols;
    this.selectedFilterColumns = this.filterCols;

    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeaders();
      this.reloadComponent(true);
    });
  }

  loadColHeaders(): void {
    this.cols = [
          { field: 'projectLabel', header:  this.translate.instant(_('PROJECTS.TABLE.PROJECT_LABEL'))},
          { field: 'projectName', header: this.translate.instant(_('PROJECTS.TABLE.PROJECT_NAME'))},
          { field: 'fundingProgram', header: this.translate.instant(_('PROJECTS.TABLE.FUNDING_PROGRAM'))},
          { field: 'promoter', header: this.translate.instant(_('PROJECTS.TABLE.PROMOTER'))},
          { field: 'fundingLabel', header: this.translate.instant(_('PROJECTS.TABLE.FUNDING_LABEL'))},
          { field: 'startDate', header: this.translate.instant(_('PROJECTS.TABLE.START_DATE'))},
          { field: 'endDate',  header: this.translate.instant(_('PROJECTS.TABLE.END_DATE'))},
          { field: 'authDate',  header: this.translate.instant(_('PROJECTS.TABLE.AUTH_DATE'))},
          { field: 'fundingRate',  header: this.translate.instant(_('PROJECTS.TABLE.FUNDING_RATE'))}
        ];

    //Filter colums
    this.filterCols = [
      { field: 'projectLabel', header:  this.translate.instant(_('PROJECTS.TABLE.PROJECT_LABEL'))},
      { field: 'projectName', header: this.translate.instant(_('PROJECTS.TABLE.PROJECT_NAME'))},
      { field: 'fundingProgram', header: this.translate.instant(_('PROJECTS.TABLE.FUNDING_PROGRAM'))},
      { field: 'promoter', header: this.translate.instant(_('PROJECTS.TABLE.PROMOTER'))},
      { field: 'fundingLabel', header: this.translate.instant(_('PROJECTS.TABLE.FUNDING_LABEL'))}
    ];
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  reloadComponent(self:boolean,urlToNavigateTo ?:string){
    //skipLocationChange:true means dont update the url to / when navigating
    //console.log("Current route I am on:",this.router.url);
   const url=self ? this.router.url :urlToNavigateTo;
   this.router.navigateByUrl('/',{skipLocationChange:true}).then(()=>{
     this.router.navigate([`/${url}`]).then(()=>{
  //console.log(`After navigation I am on:${this.router.url}`)
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

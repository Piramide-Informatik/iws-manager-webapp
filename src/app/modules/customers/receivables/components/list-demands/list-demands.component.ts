import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { TranslateService, _ } from "@ngx-translate/core";
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

interface Column {
  field: string,
  header: string
}

@Component({
  selector: 'app-list-demands',
  standalone: false,
  templateUrl: './list-demands.component.html',
  styleUrl: './list-demands.component.scss'
})
export class ListDemandsComponent implements OnInit, OnDestroy {

  public cols!: Column[];

  private langSubscription!: Subscription;

  public demands!: any[];

  public customer!: string;

  @ViewChild('dt2') dt2!: Table;

  public selectedColumns!: Column[];

  constructor(private readonly translate: TranslateService, public router: Router) { }

  ngOnInit(): void {
    this.loadColHeaders();
    this.selectedColumns = this.cols;

    this.customer = 'Joe Doe'

    this.demands = [
      {
        "idClaim": "CLM-1001",
        "idOrder": "ORD-2023-001",
        "orderTitle": "Solar Energy Project",
        "fundingProgram": "Renewable Energy 2023",
        "projectSponsor": "Ministry of Energy",
        "fundingConcentration": "Solar Energy",
        "projectStart": "15.01.2023",
        "projectEnd": "20.12.2023",
        "projectCost": 1500000,
        "abrStart": "01.02.2023",
        "abrEnd": "31.12.2023",
        "forNet": 1200000,
        "ofSt": "Approved",
        "zaGross": 1350000,
        "zaReceived": 810000,
        "zaOffen": 540000,
        "iwsPercent": 5.0
      },
      {
        "idClaim": "CLM-1002",
        "idOrder": "ORD-2023-002",
        "orderTitle": "Hospital Infrastructure",
        "fundingProgram": "Public Health 2023",
        "projectSponsor": "Ministry of Health",
        "fundingConcentration": "Infrastructure",
        "projectStart": "10.03.2023",
        "projectEnd": "28.02.2024",
        "projectCost": 2800000,
        "abrStart": "01.04.2023",
        "abrEnd": "15.03.2024",
        "forNet": 2240000,
        "ofSt": "Under review",
        "zaGross": 2520000,
        "zaReceived": 1512000,
        "zaOffen": 1008000,
        "iwsPercent": 7.5
      },
      {
        "idClaim": "CLM-1003",
        "idOrder": "ORD-2023-003",
        "orderTitle": "Rural Education Program",
        "fundingProgram": "Education 2023",
        "projectSponsor": "Ministry of Education",
        "fundingConcentration": "Rural Education",
        "projectStart": "05.02.2023",
        "projectEnd": "30.11.2023",
        "projectCost": 850000,
        "abrStart": "01.03.2023",
        "abrEnd": "15.12.2023",
        "forNet": 680000,
        "ofSt": "Paid",
        "zaGross": 765000,
        "zaReceived": 765000,
        "zaOffen": 0,
        "iwsPercent": 4.0
      },
      {
        "idClaim": "CLM-1004",
        "idOrder": "ORD-2023-004",
        "orderTitle": "Biotechnology Research",
        "fundingProgram": "Science and Technology",
        "projectSponsor": "National Science Council",
        "fundingConcentration": "Biotechnology",
        "projectStart": "20.04.2023",
        "projectEnd": "19.04.2024",
        "projectCost": 3200000,
        "abrStart": "15.05.2023",
        "abrEnd": "15.05.2024",
        "forNet": 2560000,
        "ofSt": "Approved",
        "zaGross": 2880000,
        "zaReceived": 1728000,
        "zaOffen": 1152000,
        "iwsPercent": 6.0
      },
      {
        "idClaim": "CLM-1005",
        "idOrder": "ORD-2023-005",
        "orderTitle": "Forest Conservation",
        "fundingProgram": "Environment 2023",
        "projectSponsor": "Environment Ministry",
        "fundingConcentration": "Conservation",
        "projectStart": "30.01.2023",
        "projectEnd": "15.12.2023",
        "projectCost": 1200000,
        "abrStart": "20.02.2023",
        "abrEnd": "31.12.2023",
        "forNet": 960000,
        "ofSt": "Rejected",
        "zaGross": 1080000,
        "zaReceived": 0,
        "zaOffen": 1080000,
        "iwsPercent": 5.5
      },
      {
        "idClaim": "CLM-1006",
        "idOrder": "ORD-2023-006",
        "orderTitle": "Educational Software Development",
        "fundingProgram": "Digital Innovation",
        "projectSponsor": "Economy Department",
        "fundingConcentration": "EdTech",
        "projectStart": "10.05.2023",
        "projectEnd": "30.11.2023",
        "projectCost": 750000,
        "abrStart": "01.06.2023",
        "abrEnd": "15.12.2023",
        "forNet": 600000,
        "ofSt": "Paid",
        "zaGross": 675000,
        "zaReceived": 675000,
        "zaOffen": 0,
        "iwsPercent": 3.5
      },
      {
        "idClaim": "CLM-1007",
        "idOrder": "ORD-2023-007",
        "orderTitle": "Laboratory Equipment",
        "fundingProgram": "Higher Education",
        "projectSponsor": "University Association",
        "fundingConcentration": "Educational Infrastructure",
        "projectStart": "15.03.2023",
        "projectEnd": "30.09.2023",
        "projectCost": 1850000,
        "abrStart": "10.04.2023",
        "abrEnd": "31.10.2023",
        "forNet": 1480000,
        "ofSt": "Approved",
        "zaGross": 1665000,
        "zaReceived": 999000,
        "zaOffen": 666000,
        "iwsPercent": 6.5
      },
      {
        "idClaim": "CLM-1008",
        "idOrder": "ORD-2023-008",
        "orderTitle": "Child Nutrition Program",
        "fundingProgram": "Community Health",
        "projectSponsor": "Family Development",
        "fundingConcentration": "Nutrition",
        "projectStart": "01.02.2023",
        "projectEnd": "31.08.2023",
        "projectCost": 920000,
        "abrStart": "01.03.2023",
        "abrEnd": "30.09.2023",
        "forNet": 736000,
        "ofSt": "Under review",
        "zaGross": 828000,
        "zaReceived": 496800,
        "zaOffen": 331200,
        "iwsPercent": 4.5
      },
      {
        "idClaim": "CLM-1009",
        "idOrder": "ORD-2023-009",
        "orderTitle": "Irrigation Modernization",
        "fundingProgram": "Sustainable Agriculture",
        "projectSponsor": "Agriculture Department",
        "fundingConcentration": "Agricultural Technology",
        "projectStart": "05.04.2023",
        "projectEnd": "31.03.2024",
        "projectCost": 2100000,
        "abrStart": "01.05.2023",
        "abrEnd": "30.04.2024",
        "forNet": 1680000,
        "ofSt": "Approved",
        "zaGross": 1890000,
        "zaReceived": 1134000,
        "zaOffen": 756000,
        "iwsPercent": 7.0
      },
      {
        "idClaim": "CLM-1010",
        "idOrder": "ORD-2023-010",
        "orderTitle": "Community Tourism",
        "fundingProgram": "Regional Development",
        "projectSponsor": "Tourism Board",
        "fundingConcentration": "Tourism",
        "projectStart": "01.06.2023",
        "projectEnd": "31.05.2024",
        "projectCost": 1350000,
        "abrStart": "01.07.2023",
        "abrEnd": "30.06.2024",
        "forNet": 1080000,
        "ofSt": "Paid",
        "zaGross": 1215000,
        "zaReceived": 1215000,
        "zaOffen": 0,
        "iwsPercent": 5.0
      },
      {
        "idClaim": "CLM-1011",
        "idOrder": "ORD-2023-011",
        "orderTitle": "Municipal Public Safety",
        "fundingProgram": "Public Security Fund 2023",
        "projectSponsor": "Security Department",
        "fundingConcentration": "Equipment",
        "projectStart": "10.01.2023",
        "projectEnd": "10.12.2023",
        "projectCost": 2750000,
        "abrStart": "01.02.2023",
        "abrEnd": "31.12.2023",
        "forNet": 2200000,
        "ofSt": "Rejected",
        "zaGross": 2475000,
        "zaReceived": 0,
        "zaOffen": 2475000,
        "iwsPercent": 8.0
      },
      {
        "idClaim": "CLM-1012",
        "idOrder": "ORD-2023-012",
        "orderTitle": "Graduate Scholarships",
        "fundingProgram": "Quality Education",
        "projectSponsor": "Education Department",
        "fundingConcentration": "Scholarships",
        "projectStart": "01.03.2023",
        "projectEnd": "29.02.2024",
        "projectCost": 980000,
        "abrStart": "01.04.2023",
        "abrEnd": "31.03.2024",
        "forNet": 784000,
        "ofSt": "Approved",
        "zaGross": 882000,
        "zaReceived": 529200,
        "zaOffen": 352800,
        "iwsPercent": 4.0
      },
      {
        "idClaim": "CLM-1013",
        "idOrder": "ORD-2023-013",
        "orderTitle": "Rural Telemedicine",
        "fundingProgram": "Digital Health",
        "projectSponsor": "Health Institute",
        "fundingConcentration": "Telehealth",
        "projectStart": "20.05.2023",
        "projectEnd": "19.05.2024",
        "projectCost": 1650000,
        "abrStart": "15.06.2023",
        "abrEnd": "15.06.2024",
        "forNet": 1320000,
        "ofSt": "Under review",
        "zaGross": 1485000,
        "zaReceived": 891000,
        "zaOffen": 594000,
        "iwsPercent": 5.5
      },
      {
        "idClaim": "CLM-1014",
        "idOrder": "ORD-2023-014",
        "orderTitle": "Wind Energy",
        "fundingProgram": "Energy Transition",
        "projectSponsor": "Energy Commission",
        "fundingConcentration": "Clean Energy",
        "projectStart": "15.04.2023",
        "projectEnd": "14.04.2024",
        "projectCost": 4200000,
        "abrStart": "10.05.2023",
        "abrEnd": "10.05.2024",
        "forNet": 3360000,
        "ofSt": "Approved",
        "zaGross": 3780000,
        "zaReceived": 2268000,
        "zaOffen": 1512000,
        "iwsPercent": 7.0
      },
      {
        "idClaim": "CLM-1015",
        "idOrder": "ORD-2023-015",
        "orderTitle": "Indigenous Culture",
        "fundingProgram": "Cultural Diversity",
        "projectSponsor": "Culture Department",
        "fundingConcentration": "Heritage",
        "projectStart": "28.02.2023",
        "projectEnd": "30.11.2023",
        "projectCost": 680000,
        "abrStart": "20.03.2023",
        "abrEnd": "15.12.2023",
        "forNet": 544000,
        "ofSt": "Paid",
        "zaGross": 612000,
        "zaReceived": 612000,
        "zaOffen": 0,
        "iwsPercent": 3.0
      },
      {
        "idClaim": "CLM-1016",
        "idOrder": "ORD-2023-016",
        "orderTitle": "Social Housing",
        "fundingProgram": "Urban Development",
        "projectSponsor": "Housing Institute",
        "fundingConcentration": "Housing",
        "projectStart": "05.03.2023",
        "projectEnd": "28.02.2024",
        "projectCost": 3250000,
        "abrStart": "01.04.2023",
        "abrEnd": "31.03.2024",
        "forNet": 2600000,
        "ofSt": "Approved",
        "zaGross": 2925000,
        "zaReceived": 1755000,
        "zaOffen": 1170000,
        "iwsPercent": 8.5
      },
      {
        "idClaim": "CLM-1017",
        "idOrder": "ORD-2023-017",
        "orderTitle": "Sustainable Aquaculture",
        "fundingProgram": "Responsible Fishing",
        "projectSponsor": "Fisheries Commission",
        "fundingConcentration": "Aquaculture",
        "projectStart": "10.06.2023",
        "projectEnd": "31.05.2024",
        "projectCost": 1150000,
        "abrStart": "01.07.2023",
        "abrEnd": "30.06.2024",
        "forNet": 920000,
        "ofSt": "Under review",
        "zaGross": 1035000,
        "zaReceived": 621000,
        "zaOffen": 414000,
        "iwsPercent": 6.0
      },
      {
        "idClaim": "CLM-1018",
        "idOrder": "ORD-2023-018",
        "orderTitle": "Addiction Prevention",
        "fundingProgram": "Mental Health",
        "projectSponsor": "Addiction Council",
        "fundingConcentration": "Prevention",
        "projectStart": "20.01.2023",
        "projectEnd": "31.10.2023",
        "projectCost": 875000,
        "abrStart": "15.02.2023",
        "abrEnd": "30.11.2023",
        "forNet": 700000,
        "ofSt": "Rejected",
        "zaGross": 787500,
        "zaReceived": 0,
        "zaOffen": 787500,
        "iwsPercent": 4.5
      },
      {
        "idClaim": "CLM-1019",
        "idOrder": "ORD-2023-019",
        "orderTitle": "Business Innovation",
        "fundingProgram": "Innovative SMEs",
        "projectSponsor": "Entrepreneurship Institute",
        "fundingConcentration": "Startups",
        "projectStart": "01.04.2023",
        "projectEnd": "31.12.2023",
        "projectCost": 1250000,
        "abrStart": "01.05.2023",
        "abrEnd": "31.01.2024",
        "forNet": 1000000,
        "ofSt": "Paid",
        "zaGross": 1125000,
        "zaReceived": 1125000,
        "zaOffen": 0,
        "iwsPercent": 5.0
      },
      {
        "idClaim": "CLM-1020",
        "idOrder": "ORD-2023-020",
        "orderTitle": "Civil Protection",
        "fundingProgram": "Disaster Prevention",
        "projectSponsor": "Disaster Center",
        "fundingConcentration": "Training",
        "projectStart": "15.05.2023",
        "projectEnd": "30.04.2024",
        "projectCost": 950000,
        "abrStart": "10.06.2023",
        "abrEnd": "31.05.2024",
        "forNet": 760000,
        "ofSt": "Approved",
        "zaGross": 855000,
        "zaReceived": 513000,
        "zaOffen": 342000,
        "iwsPercent": 6.5
      }
    ];

    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeaders();
      this.reloadComponent(true);
    });
  }

  loadColHeaders(): void {
    this.cols = [
      { field: 'idClaim', header: this.translate.instant(_('RECEIVABLES.TABLE.CLAIM_NUMBER')) },
      { field: 'idOrder', header: this.translate.instant(_('RECEIVABLES.TABLE.ORDER_NUMBER')) },
      { field: 'orderTitle', header: this.translate.instant(_('RECEIVABLES.TABLE.ORDER_TITLE')) },
      { field: 'fundingProgram', header: this.translate.instant(_('RECEIVABLES.TABLE.FUNDING_PROGRAM')) },
      { field: 'projectSponsor', header: this.translate.instant(_('RECEIVABLES.TABLE.PROJECT_SPONSOR')) },
      { field: 'fundingConcentration', header: this.translate.instant(_('RECEIVABLES.TABLE.FUNDING_CONCENTRATION')) },
      { field: 'projectStart', header: this.translate.instant(_('RECEIVABLES.TABLE.PROJECT_START_DATE')) },
      { field: 'projectEnd', header: this.translate.instant(_('RECEIVABLES.TABLE.PROJECT_END_DATE')) },
      { field: 'projectCost', header: this.translate.instant(_('RECEIVABLES.TABLE.PROJECT_COST')) },
      { field: 'abrStart', header: this.translate.instant(_('RECEIVABLES.TABLE.BILLING_START_DATE')) },
      { field: 'abrEnd', header: this.translate.instant(_('RECEIVABLES.TABLE.BILLING_END_DATE')) },
      { field: 'forNet', header: this.translate.instant(_('RECEIVABLES.TABLE.NET_AMOUNT')) },
      { field: 'ofSt', header: this.translate.instant(_('RECEIVABLES.TABLE.GROSS_AMOUNT')) },
      { field: 'zaGross', header: this.translate.instant(_('RECEIVABLES.TABLE.VAT_AMOUNT')) },
      { field: 'zaReceived', header: this.translate.instant(_('RECEIVABLES.TABLE.RECEIVED_AMOUNT')) },
      { field: 'zaOffen', header: this.translate.instant(_('RECEIVABLES.TABLE.OPEN_AMOUNT')) },
      { field: 'iwsPercent', header: this.translate.instant(_('RECEIVABLES.TABLE.IWS_PERCENT')) }
    ];


  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  reloadComponent(self: boolean, urlToNavigateTo?: string) {
    //skipLocationChange:true means dont update the url to / when navigating
    //console.log("Current route I am on:",this.router.url);
    const url = self ? this.router.url : urlToNavigateTo;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([`/${url}`]).then(() => {
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

  deleteDemand(idClaim: any) {
    this.demands = this.demands.filter(demand => demand.idClaim !== idClaim);
  }
}

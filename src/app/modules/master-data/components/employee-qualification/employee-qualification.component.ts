import { Component, OnInit } from "@angular/core";
import { PageTitleService } from "../../../../shared/services/page-title.service";
@Component({
  selector: 'app-employee-qualification',
  standalone: false,
  templateUrl: './employee-qualification.component.html',
  styleUrl: './employee-quelification.component.scss'
})
export class EmployeeQualificationComponent implements OnInit {

  constructor(private readonly pageTitleService: PageTitleService) { }

  ngOnInit(): void {
    this.pageTitleService.setTranslatedTitle('PAGETITLE.MASTER_DATA.EMPLOYEE_QUALIFICATION');
  }

}

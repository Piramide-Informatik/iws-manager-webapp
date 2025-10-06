import { Component, OnInit } from '@angular/core';
import { PageTitleService } from '../../../../shared/services/page-title.service';

@Component({
  selector: 'app-iws-staff',
  standalone: false,
  templateUrl: './iws-staff.component.html',
  styleUrl: './iws-staff.component.scss'
})
export class IwsStaffComponent implements OnInit{

  constructor(private readonly pageTitleService: PageTitleService) {}
  
  ngOnInit(): void {
    this.pageTitleService.setTranslatedTitle('PAGETITLE.MASTER_DATA.IWS_STAFF');
  }

}

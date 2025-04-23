import { Injectable } from '@angular/core';
import {TranslateService, _} from "@ngx-translate/core";

interface Column {
  field: string,
  header: string
}

@Injectable({
  providedIn: 'root',
})
export class SubcontractDatastoreService {
  constructor(
    private readonly translate: TranslateService,
  ) {}

  list(): any[] {
    return [
      {
        orderTitle: "Website Development",
        contractor: "Digital Creations LLC",
        project: "E-commerce Platform",
        date: "12.01.2023",
        invoiceNumber: "INV-2023-0012",
        net: 7500.00,
        gross: 8925.00,
        share: 0.35
      },
      {
        orderTitle: "Office Furniture",
        contractor: "Workspace Solutions Inc.",
        project: "New Headquarters",
        date: "25.02.2023",
        invoiceNumber: "INV-2023-0025",
        net: 18500.00,
        gross: 22015.00,
        share: 0.45
      },
      {
        orderTitle: "Marketing Campaign",
        contractor: "BrandBoost Agency",
        project: "Product Launch",
        date: "08.03.2023",
        invoiceNumber: "INV-2023-0038",
        net: 32000.00,
        gross: 38080.00,
        share: 0.20
      },
      {
        orderTitle: "Cloud Services",
        contractor: "Nimbus Cloud",
        project: "IT Infrastructure",
        date: "15.04.2023",
        invoiceNumber: "INV-2023-0045",
        net: 4200.00,
        gross: 4998.00,
        share: 1.00
      },
      {
        orderTitle: "Security System",
        contractor: "SafeGuard Technologies",
        project: "Facility Upgrade",
        date: "22.05.2023",
        invoiceNumber: "INV-2023-0052",
        net: 12500.00,
        gross: 14875.00,
        share: 0.30
      },
      {
        orderTitle: "Graphic Design",
        contractor: "Creative Minds Studio",
        project: "Rebranding",
        date: "03.06.2023",
        invoiceNumber: "INV-2023-0063",
        net: 6800.00,
        gross: 8092.00,
        share: 0.25
      },
      {
        orderTitle: "Legal Services",
        contractor: "Lex & Partners",
        project: "Contract Review",
        date: "18.07.2023",
        invoiceNumber: "INV-2023-0078",
        net: 9500.00,
        gross: 11305.00,
        share: 0.15
      },
      {
        orderTitle: "Cleaning Services",
        contractor: "Spotless Maintenance",
        project: "Office Maintenance",
        date: "29.08.2023",
        invoiceNumber: "INV-2023-0089",
        net: 3200.00,
        gross: 3808.00,
        share: 0.10
      },
      {
        orderTitle: "Software License",
        contractor: "TechSoft Inc.",
        project: "Productivity Suite",
        date: "11.09.2023",
        invoiceNumber: "INV-2023-0091",
        net: 15000.00,
        gross: 17850.00,
        share: 0.60
      },
      {
        orderTitle: "Event Planning",
        contractor: "Memorable Events Co.",
        project: "Annual Conference",
        date: "24.10.2023",
        invoiceNumber: "INV-2023-0104",
        net: 28500.00,
        gross: 33915.00,
        share: 0.40
      },
      {
        orderTitle: "Printing Services",
        contractor: "QuickPrint Solutions",
        project: "Marketing Materials",
        date: "05.11.2023",
        invoiceNumber: "INV-2023-0115",
        net: 4200.00,
        gross: 4998.00,
        share: 0.18
      },
      {
        orderTitle: "Consulting Services",
        contractor: "Business Insights Ltd.",
        project: "Strategy Development",
        date: "17.12.2023",
        invoiceNumber: "INV-2023-0127",
        net: 22500.00,
        gross: 26775.00,
        share: 0.35
      },
      {
        orderTitle: "IT Equipment",
        contractor: "TechGear Suppliers",
        project: "Workstation Upgrade",
        date: "09.01.2024",
        invoiceNumber: "INV-2024-0009",
        net: 18700.00,
        gross: 22253.00,
        share: 0.50
      },
      {
        orderTitle: "Translation Services",
        contractor: "Global Languages Inc.",
        project: "Document Localization",
        date: "22.02.2024",
        invoiceNumber: "INV-2024-0022",
        net: 6800.00,
        gross: 8092.00,
        share: 0.22
      },
      {
        orderTitle: "Catering Services",
        contractor: "Gourmet Delights",
        project: "Employee Appreciation",
        date: "14.03.2024",
        invoiceNumber: "INV-2024-0034",
        net: 9500.00,
        gross: 11305.00,
        share: 0.28
      },
      {
        orderTitle: "Video Production",
        contractor: "Motion Picture Studios",
        project: "Corporate Video",
        date: "27.04.2024",
        invoiceNumber: "INV-2024-0047",
        net: 15200.00,
        gross: 18088.00,
        share: 0.33
      },
      {
        orderTitle: "HR Software",
        contractor: "PeopleTech Solutions",
        project: "HR System Implementation",
        date: "08.05.2024",
        invoiceNumber: "INV-2024-0058",
        net: 32000.00,
        gross: 38080.00,
        share: 0.75
      },
      {
        orderTitle: "Travel Expenses",
        contractor: "Global Travel Partners",
        project: "Client Meetings",
        date: "19.06.2024",
        invoiceNumber: "INV-2024-0069",
        net: 12500.00,
        gross: 14875.00,
        share: 0.42
      },
      {
        orderTitle: "Market Research",
        contractor: "DataInsight Analytics",
        project: "Consumer Study",
        date: "02.07.2024",
        invoiceNumber: "INV-2024-0072",
        net: 28500.00,
        gross: 33915.00,
        share: 0.30
      },
      {
        orderTitle: "Insurance Premium",
        contractor: "SafeCover Insurance",
        project: "Annual Coverage",
        date: "15.08.2024",
        invoiceNumber: "INV-2024-0085",
        net: 18700.00,
        gross: 22253.00,
        share: 1.00
      }
    ];
  }

  getSubcontractsColumns(): Column[] {
    return [
      { field: 'orderTitle', header:  this.translate.instant(_('SUB-CONTRACTS.TABLE.ORDER_TITLE'))},
      { field: 'contractor', header:  this.translate.instant(_('SUB-CONTRACTS.TABLE.CONTRACTOR'))},
      { field: 'project', header:  this.translate.instant(_('SUB-CONTRACTS.TABLE.PROJECT'))},
      { field: 'date', header:  this.translate.instant(_('SUB-CONTRACTS.TABLE.DATE'))},
      { field: 'invoiceNumber', header: this.translate.instant(_('SUB-CONTRACTS.TABLE.INVOICE_NUMBER'))},
      { field: 'net', header: this.translate.instant(_('SUB-CONTRACTS.TABLE.NET_INVOICE'))},
      { field: 'gross', header:   this.translate.instant(_('SUB-CONTRACTS.TABLE.GROSS_INVOICE'))},
      { field: 'share',header:   this.translate.instant(_('SUB-CONTRACTS.TABLE.SHARE'))}
    ];
  }
}

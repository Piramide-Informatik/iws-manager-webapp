import { Component, OnInit, Input, Output } from '@angular/core';
import { MessageService, SelectItem } from 'primeng/api';
import { EmployeeContract } from '../../models/employee-contract';
import { EmployeeContractService } from '../../services/employee-contract.service';
import { Salutation } from '../../models/salutation';
import { Title } from '../../models/title';
import { QualificationFZ } from '../../models/qualification-fz';

@Component({
  selector: 'app-employee-details',
  standalone: false,
  templateUrl: './employee-details.component.html',
  styleUrl: './employee-details.component.scss',

  providers: [MessageService, EmployeeContractService]
})
export class EmployeeDetailsComponent implements OnInit {

  titles: Title[] | undefined;

  salutations: Salutation[] | undefined;

  qualificationsFZ: QualificationFZ[] | undefined;

  employeeContracts!: EmployeeContract[];

  statuses!: SelectItem[];

  clonedEmployeeContracts: { [s: string]: EmployeeContract } = {};

  @Input() customerName!: string | undefined;
  @Input() employeeNumber!: string | undefined;
  @Input() salutationId!: string | undefined;
  @Input() titleId!: string | undefined;
  @Input() employeeFirstName!: string | undefined;
  @Input() employeeLastName!: string | undefined;
  @Input() employeeEmail!: string;
  @Input() generalManagerSinceDate!: string;
  @Input() shareholderSinceDate!: string;
  @Input() solePropietorSinceDate!: string;
  @Input() coentrepreneurSinceDate!: string;
  @Input() qualificationFzId!: string;
  @Input() qualificationKMUi!: string;
  searchText: string = '';
  nextId: number = 1;

  constructor(private employeeContractService: EmployeeContractService, private messageService: MessageService) { }

  ngOnInit(): void {

    this.employeeContractService.getEmployeeContractsData().then((data) => {
      this.employeeContracts = data;
    });

    this.salutations = [
      { id: 1, name: 'Frau', description: 'Men' },
      { id: 2, name: 'Herr', description: 'Women' },

    ];

    this.titles = [
      { id: 1, name: 'Sir', description: 'title' },
      { id: 2, name: 'Lord', description: 'title' },
      { id: 3, name: 'Captain', description: 'title' },
      { id: 4, name: 'Proffesor', description: 'title' },
      { id: 5, name: 'Dr.', description: 'title' }

    ];


    this.qualificationsFZ = [
      { id: 1, name: 'Micro', description: 'title' },
      { id: 2, name: 'Small', description: 'title' },
      { id: 3, name: 'Medium', description: 'title' }

    ];
  }

  onRowEditInit(employeeContract: EmployeeContract) {
    this.clonedEmployeeContracts[employeeContract.id as string] = { ...employeeContract };
  }

  onRowEditSave(employeeContract: EmployeeContract) {
    if (employeeContract) {
      delete this.clonedEmployeeContracts[employeeContract.id as string];
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Contract is updated' });
    } else {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Invalid Contract' });
    }
  }

  onRowEditCancel(product: EmployeeContract, index: number) {
    this.employeeContracts[index] = this.clonedEmployeeContracts[product.id as string];
    delete this.clonedEmployeeContracts[product.id as string];
  }

}

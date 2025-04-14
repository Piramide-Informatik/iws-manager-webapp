import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Table } from 'primeng/table';

interface ProjectAllocationEntry {
  projectName: string;
  percentage: number;
  amount: number;
}

@Component({
  selector: 'app-project-allocation',
  standalone: false,
  templateUrl: './project-allocation.component.html',
  styleUrl: './project-allocation.component.scss',
})
export class ProjectAllocationComponent implements OnInit {
  allocationForm!: FormGroup;
  allocations: ProjectAllocationEntry[] = [];

  @ViewChild('dt') dt!: Table;
  loading: boolean = true;

  visibleModal = signal(false);
  option = {
    new: 'New',
    edit: 'Edit',
  };
  optionSelected: string = '';
  selectedProjectName!: string;

  ngOnInit(): void {
    this.allocationForm = new FormGroup({
      projectName: new FormControl('', Validators.required),
      percentage: new FormControl('', Validators.required),
      amount: new FormControl('', Validators.required),
    });

    this.loading = false;
  }

  showModal(option: string, projectName?: string) {
    this.optionSelected = option;

    if (option === this.option.edit && projectName != null) {
      const entry = this.allocations.find((a) => a.projectName === projectName);
      if (entry) {
        this.allocationForm.setValue({
          projectName: entry.projectName,
          percentage: entry.percentage,
          amount: entry.amount,
        });
        this.selectedProjectName = entry.projectName;
      }
    }

    this.visibleModal.set(true);
  }

  closeModal() {
    this.visibleModal.set(false);
    this.allocationForm.reset();
    this.optionSelected = '';
  }

  saveAllocation() {
    if (this.allocationForm.invalid) return;

    const data = this.allocationForm.value;

    if (this.optionSelected === this.option.new) {
      this.allocations.push(data);
    } else if (this.optionSelected === this.option.edit) {
      this.allocations = this.allocations.map((entry) =>
        entry.projectName === this.selectedProjectName ? data : entry
      );
    }

    this.closeModal();
  }

  deleteAllocation(projectName: string) {
    this.allocations = this.allocations.filter(
      (entry) => entry.projectName !== projectName
    );
  }
}

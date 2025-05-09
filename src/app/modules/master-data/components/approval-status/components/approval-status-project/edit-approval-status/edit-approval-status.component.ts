import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-edit-approval-status',
  standalone: false,
  templateUrl: './edit-approval-status.component.html',
  styleUrl: './edit-approval-status.component.scss',
})
export class EditApprovalStatusComponent implements OnInit {
  public editApprovalStatusForm!: FormGroup;

  ngOnInit(): void {
    this.editApprovalStatusForm = new FormGroup({
      approvalStatus: new FormControl('', [Validators.required]),
      order: new FormControl('', [Validators.required]),
      appliesToProject: new FormControl('', [Validators.required]),
      appliesToNetwork: new FormControl('', [Validators.required]),
    });
  }
}

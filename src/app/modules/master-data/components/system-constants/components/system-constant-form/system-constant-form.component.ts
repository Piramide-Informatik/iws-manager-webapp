import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { System } from '../../../../../../Entities/system';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';
import { SystemConstantUtils } from '../../utils/system-constant.utils';
import { InputNumber } from 'primeng/inputnumber';

@Component({
  selector: 'app-system-constant-form',
  standalone: false,
  templateUrl: './system-constant-form.component.html',
  styleUrl: './system-constant-form.component.scss'
})
export class SystemConstantFormComponent implements OnInit, OnChanges {
  @Input() selectedSystemConstant!: System | null;
  @Output() cancelAction = new EventEmitter();
  @ViewChild('firstInput') firstInput!: InputNumber;
  private readonly systemConstantUtils = inject(SystemConstantUtils);
  editSystemConstantForm!: FormGroup;
  isLoading = false;

  constructor( private readonly commonMessageService: CommonMessagesService ){ }

  ngOnInit(): void {
    this.editSystemConstantForm = new FormGroup({
      name: new FormControl({value: '', disabled: true}),
      valueNum: new FormControl(null),
      valueChar: new FormControl(''),
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    let systemConstantChange = changes['selectedSystemConstant'];
    if (systemConstantChange && !systemConstantChange.firstChange) {
      if (systemConstantChange.currentValue == null) {
        this.clearForm();
      } else {
        this.editSystemConstantForm.patchValue(systemConstantChange.currentValue);
        this.focusInputIfNeeded();
      }
    }
  }

  onSubmit(): void {
    if(this.editSystemConstantForm.invalid || !this.editSystemConstantForm) return
    if (this.selectedSystemConstant === null) return;
    this.isLoading = true;
    const systemConstantData = Object.assign(this.selectedSystemConstant, this.editSystemConstantForm.value);
    this.systemConstantUtils.updateSystemConstant(systemConstantData).subscribe({
      next: () => {
        this.isLoading = false;
        this.clearForm();
        this.commonMessageService.showEditSucessfullMessage();
      },
      error: (error) => {
        console.log(error)
        this.isLoading = false;
        this.commonMessageService.showErrorEditMessage();
      }
    });
  }

  public clearForm(): void {
    this.editSystemConstantForm.reset();
    this.selectedSystemConstant = null;
    this.cancelAction.emit(true);
  }

  private focusInputIfNeeded(): void {
    if (this.selectedSystemConstant && this.firstInput) {
      setTimeout(() => {
        if (this.firstInput?.input.nativeElement) {
          this.firstInput.input.nativeElement.focus();
        }
      }, 200);
    }
  }
}
import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SystemConstantService } from '../../services/system-constant.service';
import { System } from '../../../../../../Entities/system';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';
import { SystemConstantUtils } from '../../utils/system-constant.utils';

@Component({
  selector: 'app-system-constant-form',
  standalone: false,
  templateUrl: './system-constant-form.component.html',
  styleUrl: './system-constant-form.component.scss'
})
export class SystemConstantFormComponent implements OnInit, OnChanges {

  @Input() selectedSystemConstant!: System | null;
  @Output() cancelAction = new EventEmitter();
  private readonly systemConstantUtils = inject(SystemConstantUtils);
  editSystemConstantForm!: FormGroup;
  isLoading = false;

  constructor( private readonly commonMessageService: CommonMessagesService ){ }

  ngOnInit(): void {
    this.editSystemConstantForm = new FormGroup({
      name: new FormControl({value: '', disabled: true}),
      valueNum: new FormControl('', [Validators.pattern('^-?[0-9]+(\.[0-9]+)?')]),
      valueChar: new FormControl('', [Validators.pattern('^[a-zA-Z0-9]*$')]),
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    let systemConstantChange = changes['selectedSystemConstant'];
    if (systemConstantChange && !systemConstantChange.firstChange) {
      this.editSystemConstantForm.patchValue(systemConstantChange.currentValue);
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
}
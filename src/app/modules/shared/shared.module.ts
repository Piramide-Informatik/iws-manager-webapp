//Angular 
import { NgModule } from '@angular/core';

//Modulos
import { TranslateDirective, TranslateModule, TranslatePipe } from '@ngx-translate/core';

//Components
import { OccErrorModalComponent } from './components/occ-error-modal/occ-error-modal.component';
import { AutoFocusOnVisibleDirective } from './directives/auto-focus-on-visible.directive';
import { CustomPopoverComponent } from './components/custom-popover/custom-popover.component';
import { CommonModule } from '@angular/common';

import { PopoverModule } from 'primeng/popover';
import { ButtonModule } from 'primeng/button';
import { Error403Component } from './components/error403/error403.component';

@NgModule({
  declarations: [
    OccErrorModalComponent,
    AutoFocusOnVisibleDirective,
    CustomPopoverComponent,
    Error403Component
  ],
  imports: [
    ButtonModule,
    CommonModule,
    PopoverModule,
    TranslateDirective,
    TranslateModule,
    TranslatePipe
  ],
  exports: [
    CustomPopoverComponent,
    OccErrorModalComponent,
    AutoFocusOnVisibleDirective
  ]
})
export class SharedModule { }

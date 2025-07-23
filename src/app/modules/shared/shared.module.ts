//Angular 
import { NgModule } from '@angular/core';

//Modulos
import { TranslateDirective, TranslateModule, TranslatePipe } from '@ngx-translate/core';

//Components
import { OccErrorModalComponent } from './components/occ-error-modal/occ-error-modal.component';
import { AutoFocusOnVisibleDirective } from './directives/auto-focus-on-visible.directive';

@NgModule({
  declarations: [
    OccErrorModalComponent,
    AutoFocusOnVisibleDirective
  ],
  imports: [
    TranslateDirective,
    TranslateModule,
    TranslatePipe,
  ],
  exports: [
    OccErrorModalComponent,
    AutoFocusOnVisibleDirective
  ]
})
export class SharedModule { }

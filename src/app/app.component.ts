import { Component } from '@angular/core';

import {
  TranslatePipe,
  TranslateDirective,
} from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  providers: [TranslatePipe, TranslateDirective],
  standalone: false,
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'iws-manager-webapp';

  constructor() {
  }
}

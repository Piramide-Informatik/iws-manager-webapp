// shared/directives/auto-focus-on-visible.directive.ts
import { Directive, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appAutoFocusOnVisible]',
  standalone: false
})
export class AutoFocusOnVisibleDirective implements OnChanges {
  @Input('appAutoFocusOnVisible') visible = false;

  constructor(private el: ElementRef<HTMLInputElement>) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible) {
      setTimeout(() => {
        this.el.nativeElement?.focus();
      }, 300);
    }
  }
}

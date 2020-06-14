import { Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[ngxDateView]'
})
export class DateViewDirective {
  @Input() set needChange(value: any) {
    setTimeout(() => {
      this.changeValue();
    }, 10);

  }

  constructor(
    private _el: ElementRef
  ) {}

  changeValue() {
    if (this._el.nativeElement.value) {
      const arr = this._el.nativeElement.value.split('/');
      if (arr.length > 2) {
        this._el.nativeElement.value = arr[arr.length - 1];
      }
    }
  }
}

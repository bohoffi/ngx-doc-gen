import { Directive } from '@angular/core';

@Directive({
  selector: '[ngxDocGenStandaloneApi], test[test]',
  standalone: true,
})
export class StandaloneApiDirective {}

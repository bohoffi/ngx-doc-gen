import { Directive, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@Directive({
  selector: '[ngxDocGenDemoScamDir]'
})
export class DemoScamDirDirective { }

@NgModule({
  imports: [CommonModule],
  declarations: [DemoScamDirDirective],
  exports: [DemoScamDirDirective],
})
export class DemoScamDirDirectiveModule { }

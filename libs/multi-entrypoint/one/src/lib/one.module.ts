import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgDemoDirective } from './directives/ng-demo.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [
    NgDemoDirective
  ],
  exports: [
    NgDemoDirective
  ],
})
export class OneModule {}

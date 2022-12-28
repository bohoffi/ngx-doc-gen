import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './standalone-api.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StandaloneApiComponent {}

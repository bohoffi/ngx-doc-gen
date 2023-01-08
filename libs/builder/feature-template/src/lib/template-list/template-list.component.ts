import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'template-builder-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './template-list.component.html',
  styleUrls: ['./template-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateListComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}

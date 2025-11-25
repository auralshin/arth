import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-notebook-standards',
  templateUrl: './notebook-standards.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotebookStandardsComponent extends BasePageComponent {}

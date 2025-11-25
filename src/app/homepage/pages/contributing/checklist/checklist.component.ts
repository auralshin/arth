import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-checklist',
  templateUrl: './checklist.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChecklistComponent extends BasePageComponent {}

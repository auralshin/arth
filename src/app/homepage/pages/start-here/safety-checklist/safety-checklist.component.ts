import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-safety-checklist',
  templateUrl: './safety-checklist.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SafetyChecklistComponent extends BasePageComponent {}

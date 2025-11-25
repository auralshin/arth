import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-security-checklist',
  templateUrl: './security-checklist.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecurityChecklistComponent extends BasePageComponent {}

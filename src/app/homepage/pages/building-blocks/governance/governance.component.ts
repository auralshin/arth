import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-governance',
  templateUrl: './governance.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GovernanceComponent extends BasePageComponent {}

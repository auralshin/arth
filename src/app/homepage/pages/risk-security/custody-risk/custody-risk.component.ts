import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-custody-risk',
  templateUrl: './custody-risk.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustodyRiskComponent extends BasePageComponent {}

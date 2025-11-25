import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-oracle-risk',
  templateUrl: './oracle-risk.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OracleRiskComponent extends BasePageComponent {}

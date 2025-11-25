import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-risk-reality-check',
  templateUrl: './risk-reality-check.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RiskRealityCheckComponent extends BasePageComponent {}

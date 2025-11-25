import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-rebalancing',
  templateUrl: './rebalancing.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RebalancingComponent extends BasePageComponent {}

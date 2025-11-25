import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-staking-restaking-yield',
  templateUrl: './staking-restaking-yield.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StakingRestakingYieldComponent extends BasePageComponent {}

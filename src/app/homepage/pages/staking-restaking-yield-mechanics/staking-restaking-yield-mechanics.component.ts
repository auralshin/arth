import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-staking-restaking-yield-mechanics',
  templateUrl: './staking-restaking-yield-mechanics.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StakingRestakingYieldMechanicsComponent extends BasePageComponent {}

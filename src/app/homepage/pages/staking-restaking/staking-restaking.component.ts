import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-staking-restaking',
  templateUrl: './staking-restaking.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StakingRestakingComponent extends BasePageComponent {}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-proof-of-stake-math',
  templateUrl: './proof-of-stake-math.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProofOfStakeMathComponent extends BasePageComponent {}

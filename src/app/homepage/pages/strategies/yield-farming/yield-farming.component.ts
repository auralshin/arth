import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-yield-farming',
  templateUrl: './yield-farming.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class YieldFarmingComponent extends BasePageComponent {}

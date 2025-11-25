import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-gas-optimization',
  templateUrl: './gas-optimization.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GasOptimizationComponent extends BasePageComponent {}

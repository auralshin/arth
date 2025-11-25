import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-optimization',
  templateUrl: './optimization.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OptimizationComponent extends BasePageComponent {}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-portfolio-optimization',
  templateUrl: './portfolio-optimization.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfolioOptimizationComponent extends BasePageComponent {}

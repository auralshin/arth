import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-quantitative-defi-modeling',
  templateUrl: './quantitative-defi-modeling.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuantitativeDefiModelingComponent extends BasePageComponent {}

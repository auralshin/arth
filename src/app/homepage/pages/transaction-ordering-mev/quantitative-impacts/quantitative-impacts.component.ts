import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-quantitative-impacts',
  templateUrl: './quantitative-impacts.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuantitativeImpactsComponent extends BasePageComponent {}

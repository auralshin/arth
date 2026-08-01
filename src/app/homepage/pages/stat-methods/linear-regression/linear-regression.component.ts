import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-linear-regression',
  templateUrl: './linear-regression.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinearRegressionComponent extends BasePageComponent {}

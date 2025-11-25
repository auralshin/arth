import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-regression',
  templateUrl: './regression.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegressionComponent extends BasePageComponent {}

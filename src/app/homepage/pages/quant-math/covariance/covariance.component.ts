import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-covariance',
  templateUrl: './covariance.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CovarianceComponent extends BasePageComponent {}

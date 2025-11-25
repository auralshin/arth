import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-expectation-variance',
  templateUrl: './expectation-variance.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpectationVarianceComponent extends BasePageComponent {}

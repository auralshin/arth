import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-mean-variance',
  templateUrl: './mean-variance.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MeanVarianceComponent extends BasePageComponent {}

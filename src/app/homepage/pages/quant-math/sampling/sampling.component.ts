import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-sampling',
  templateUrl: './sampling.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SamplingComponent extends BasePageComponent {}

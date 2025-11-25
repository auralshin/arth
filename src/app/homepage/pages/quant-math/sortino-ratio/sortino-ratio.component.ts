import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-sortino-ratio',
  templateUrl: './sortino-ratio.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SortinoRatioComponent extends BasePageComponent {}

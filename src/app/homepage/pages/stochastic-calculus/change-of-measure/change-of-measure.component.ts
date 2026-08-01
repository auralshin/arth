import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-change-of-measure',
  templateUrl: './change-of-measure.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangeOfMeasureComponent extends BasePageComponent {}

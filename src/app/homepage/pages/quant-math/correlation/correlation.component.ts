import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-correlation',
  templateUrl: './correlation.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CorrelationComponent extends BasePageComponent {}

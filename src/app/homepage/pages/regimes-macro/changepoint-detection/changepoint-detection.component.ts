import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-changepoint-detection',
  templateUrl: './changepoint-detection.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangepointDetectionComponent extends BasePageComponent {}

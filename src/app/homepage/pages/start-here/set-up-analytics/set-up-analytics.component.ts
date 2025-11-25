import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-set-up-analytics',
  templateUrl: './set-up-analytics.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SetUpAnalyticsComponent extends BasePageComponent {}

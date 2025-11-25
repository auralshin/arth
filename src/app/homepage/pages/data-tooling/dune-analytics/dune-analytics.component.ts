import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-dune-analytics',
  templateUrl: './dune-analytics.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DuneAnalyticsComponent extends BasePageComponent {}

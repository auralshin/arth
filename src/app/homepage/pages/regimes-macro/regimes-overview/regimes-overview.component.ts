import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-regimes-overview',
  templateUrl: './regimes-overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegimesOverviewComponent extends BasePageComponent {}

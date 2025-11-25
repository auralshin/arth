import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-mev-overview',
  templateUrl: './mev-overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MevOverviewComponent extends BasePageComponent {}

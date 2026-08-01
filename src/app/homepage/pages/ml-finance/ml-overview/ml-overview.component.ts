import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-ml-overview',
  templateUrl: './ml-overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MlOverviewComponent extends BasePageComponent {}

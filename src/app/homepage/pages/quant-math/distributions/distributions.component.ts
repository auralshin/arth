import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-distributions',
  templateUrl: './distributions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DistributionsComponent extends BasePageComponent {}

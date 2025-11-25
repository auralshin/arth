import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-fees-routing',
  templateUrl: './fees-routing.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeesRoutingComponent extends BasePageComponent {}

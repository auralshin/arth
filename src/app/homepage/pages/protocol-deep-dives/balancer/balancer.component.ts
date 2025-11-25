import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-balancer',
  templateUrl: './balancer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BalancerComponent extends BasePageComponent {}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-stat-arb',
  templateUrl: './stat-arb.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatArbComponent extends BasePageComponent {}

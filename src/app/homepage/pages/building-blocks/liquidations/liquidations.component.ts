import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-liquidations',
  templateUrl: './liquidations.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LiquidationsComponent extends BasePageComponent {}

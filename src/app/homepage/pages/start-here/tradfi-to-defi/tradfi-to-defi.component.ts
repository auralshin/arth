import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-tradfi-to-defi',
  templateUrl: './tradfi-to-defi.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TradfiToDeFiComponent extends BasePageComponent {}

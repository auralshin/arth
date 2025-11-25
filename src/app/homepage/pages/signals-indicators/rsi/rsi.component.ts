import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-rsi',
  templateUrl: './rsi.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RsiComponent extends BasePageComponent {}

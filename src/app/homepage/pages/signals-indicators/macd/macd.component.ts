import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-macd',
  templateUrl: './macd.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MacdComponent extends BasePageComponent {}

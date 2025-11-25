import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-drawdown',
  templateUrl: './drawdown.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DrawdownComponent extends BasePageComponent {}

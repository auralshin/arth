import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-breakout',
  templateUrl: './breakout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreakoutComponent extends BasePageComponent {}

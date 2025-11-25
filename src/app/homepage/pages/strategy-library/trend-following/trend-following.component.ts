import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-trend-following',
  templateUrl: './trend-following.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrendFollowingComponent extends BasePageComponent {}

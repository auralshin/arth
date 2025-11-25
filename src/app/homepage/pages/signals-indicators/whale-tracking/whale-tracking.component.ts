import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-whale-tracking',
  templateUrl: './whale-tracking.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WhaleTrackingComponent extends BasePageComponent {}

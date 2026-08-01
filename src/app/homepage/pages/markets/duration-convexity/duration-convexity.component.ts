import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-duration-convexity',
  templateUrl: './duration-convexity.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DurationConvexityComponent extends BasePageComponent {}

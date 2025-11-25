import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-roadmap',
  templateUrl: './roadmap.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoadmapComponent extends BasePageComponent {}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-top-level-roadmap',
  templateUrl: './top-level-roadmap.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopLevelRoadmapComponent extends BasePageComponent {}

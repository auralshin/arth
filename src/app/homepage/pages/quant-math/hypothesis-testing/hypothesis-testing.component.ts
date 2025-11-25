import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-hypothesis-testing',
  templateUrl: './hypothesis-testing.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HypothesisTestingComponent extends BasePageComponent {}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-scenarios',
  templateUrl: './scenarios.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScenariosComponent extends BasePageComponent {}

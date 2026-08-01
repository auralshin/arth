import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-multiple-testing',
  templateUrl: './multiple-testing.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultipleTestingComponent extends BasePageComponent {}

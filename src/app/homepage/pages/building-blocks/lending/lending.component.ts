import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-lending',
  templateUrl: './lending.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LendingComponent extends BasePageComponent {}

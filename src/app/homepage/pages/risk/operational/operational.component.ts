import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-operational',
  templateUrl: './operational.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationalComponent extends BasePageComponent {}

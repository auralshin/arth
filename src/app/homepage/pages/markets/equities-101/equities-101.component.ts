import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-equities-101',
  templateUrl: './equities-101.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Equities101Component extends BasePageComponent {}

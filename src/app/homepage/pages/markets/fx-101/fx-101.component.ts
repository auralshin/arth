import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-fx-101',
  templateUrl: './fx-101.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Fx101Component extends BasePageComponent {}

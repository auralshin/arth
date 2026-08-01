import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-fx-carry-parity',
  templateUrl: './fx-carry-parity.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FxCarryParityComponent extends BasePageComponent {}

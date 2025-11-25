import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-protocol-risk',
  templateUrl: './protocol-risk.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProtocolRiskComponent extends BasePageComponent {}

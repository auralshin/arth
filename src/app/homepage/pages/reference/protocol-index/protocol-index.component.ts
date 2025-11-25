import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-protocol-index',
  templateUrl: './protocol-index.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProtocolIndexComponent extends BasePageComponent {}

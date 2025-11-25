import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-rpc-nodes',
  templateUrl: './rpc-nodes.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RpcNodesComponent extends BasePageComponent {}

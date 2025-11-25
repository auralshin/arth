import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-blockchain-execution-environments',
  templateUrl: './blockchain-execution-environments.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlockchainExecutionEnvironmentsComponent extends BasePageComponent {}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-gas-mempool',
  templateUrl: './gas-mempool.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GasMempoolComponent extends BasePageComponent {}

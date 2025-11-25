import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-set-up-wallet',
  templateUrl: './set-up-wallet.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SetUpWalletComponent extends BasePageComponent {}

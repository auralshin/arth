import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-tokens-addresses',
  templateUrl: './tokens-addresses.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TokensAddressesComponent extends BasePageComponent {}

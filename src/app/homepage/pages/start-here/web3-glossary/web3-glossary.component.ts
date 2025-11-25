import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-web3-glossary',
  templateUrl: './web3-glossary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Web3GlossaryComponent extends BasePageComponent {}

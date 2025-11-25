import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-tokenomics',
  templateUrl: './tokenomics.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TokenomicsComponent extends BasePageComponent {}

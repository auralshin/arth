import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-tokens-101',
  templateUrl: './tokens-101.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Tokens101Component extends BasePageComponent {}

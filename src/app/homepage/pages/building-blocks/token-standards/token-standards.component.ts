import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-token-standards',
  templateUrl: './token-standards.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TokenStandardsComponent extends BasePageComponent {}

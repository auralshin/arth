import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-cvar',
  templateUrl: './cvar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvarComponent extends BasePageComponent {}

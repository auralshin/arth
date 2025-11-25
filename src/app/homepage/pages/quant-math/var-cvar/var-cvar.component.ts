import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-var-cvar',
  templateUrl: './var-cvar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VarCvarComponent extends BasePageComponent {}

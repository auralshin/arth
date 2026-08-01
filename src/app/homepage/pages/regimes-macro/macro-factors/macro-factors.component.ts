import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-macro-factors',
  templateUrl: './macro-factors.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MacroFactorsComponent extends BasePageComponent {}

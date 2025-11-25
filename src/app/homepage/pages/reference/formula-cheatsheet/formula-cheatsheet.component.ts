import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-formula-cheatsheet',
  templateUrl: './formula-cheatsheet.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormulaCheatsheetComponent extends BasePageComponent {}

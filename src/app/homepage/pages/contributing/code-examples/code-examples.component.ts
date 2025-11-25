import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-code-examples',
  templateUrl: './code-examples.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodeExamplesComponent extends BasePageComponent {}

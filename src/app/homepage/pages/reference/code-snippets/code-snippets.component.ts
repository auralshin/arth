import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-code-snippets',
  templateUrl: './code-snippets.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodeSnippetsComponent extends BasePageComponent {}

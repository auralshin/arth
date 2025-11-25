import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-typescript',
  templateUrl: './typescript.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TypescriptComponent extends BasePageComponent {}

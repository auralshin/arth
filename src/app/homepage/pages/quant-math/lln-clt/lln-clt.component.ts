import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-lln-clt',
  templateUrl: './lln-clt.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LlnCltComponent extends BasePageComponent {}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-glossary',
  templateUrl: './glossary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GlossaryComponent extends BasePageComponent {}

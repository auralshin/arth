import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-cds',
  templateUrl: './cds.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CdsComponent extends BasePageComponent {}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-protocols',
  templateUrl: './protocols.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProtocolsComponent extends BasePageComponent {}

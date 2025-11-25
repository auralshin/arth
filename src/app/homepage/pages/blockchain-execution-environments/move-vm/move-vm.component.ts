import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-move-vm',
  templateUrl: './move-vm.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoveVmComponent extends BasePageComponent {}

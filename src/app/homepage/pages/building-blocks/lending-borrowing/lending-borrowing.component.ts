import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-lending-borrowing',
  templateUrl: './lending-borrowing.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LendingBorrowingComponent extends BasePageComponent {}

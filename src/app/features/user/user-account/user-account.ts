import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-user-account',
  standalone:true,
  imports: [],
  template: `<p>user-account works!</p>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserAccount {

 }

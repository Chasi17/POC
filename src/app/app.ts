import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Parent } from './Components/parent/parent';
import { ToastrModule } from 'ngx-toastr';

@Component({
  selector: 'app-root',
  imports: [Parent,ToastrModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'final';
}

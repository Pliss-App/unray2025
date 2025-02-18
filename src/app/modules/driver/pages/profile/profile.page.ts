import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MenuController } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  username: any = null;
  user: any = null;
  profileForm!: FormGroup;
  isUpdateButtonDisabled: boolean = true;
  userRole: any;


  constructor(private auth: AuthService, private menuController: MenuController) {
    this.userRole = this.auth.getRole();
  }

  ngOnInit() {
  }

  openMenu() {
    if (this.userRole === 'usuario') {
      this.menuController.open('userMenu'); // Especifica el menú a abrir

    } else if (this.userRole === 'conductor') {
      this.menuController.open('driverMenu'); // Especifica el menú a abrir
    }
  }

}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-billetera',
  templateUrl: './billetera.component.html',
  styleUrls: ['./billetera.component.scss'],
})
export class BilleteraComponent implements OnInit {
  user: any = {}
  saldo: number = 0;
  isLoading = false;

  constructor(private api: UserService, private auth: AuthService, private router: Router) {
    this.user = this.auth.getUser();
  }

  ngOnInit() {
    this.getSaldo();
  }

  getSaldo() {
    this.isLoading = true;
    try {
      this.api.getSaldo(this.user.idUser).subscribe((re) => {
        if (re.result) {
          const data = re.result;
          this.saldo = data.saldo;
          this.isLoading = false;
        }
      })
    } catch (error) {
      console.error(error);
      this.isLoading = false;
    }
  }


  recargar() {
    this.router.navigate(['/driver/recargar']); // Navegar a la página de perfil

    // this.router.navigate(['recargar']);
  }

}

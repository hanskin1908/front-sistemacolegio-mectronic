import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { UserProfile } from './models/auth.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Sistema de Registro en Línea';
  userProfile: UserProfile | null = null;
  isStudent = false;
  isAdmin = false;
  isProfessor = false;
  
  constructor(private authService: AuthService) {}
  
  ngOnInit() {
    // Detectar cambios en el estado de autenticación
    this.authService.user$.subscribe(user => {
      if (user !== this.userProfile) {
        this.userProfile = user;
        if (user) {
          this.isStudent = user.role === 'student';
          this.isAdmin = user.role === 'admin';
          this.isProfessor = user.role === 'professor';
        } else {
          this.isStudent = false;
          this.isAdmin = false;
          this.isProfessor = false;
        }
      }
    });
  }
  
  onLogout() {
    this.authService.logout();
  }
}
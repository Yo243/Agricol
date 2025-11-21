import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PeriodosSiembraService } from '../../services/periodos-siembra.service';

@Component({
  selector: 'app-periodo-siembra-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './periodo-siembra-list.component.html',
  styleUrls: ['./periodo-siembra-list.component.css']
})
export class PeriodoSiembraListComponent implements OnInit {
  periodos: any[] = [];
  loading: boolean = true;
  filtroEstado: string = 'todos'; // todos | activos | finalizados

  constructor(private periodosService: PeriodosSiembraService) {}

  ngOnInit(): void {
    this.loadPeriodos();
  }

  loadPeriodos(): void {
    this.loading = true;

    if (this.filtroEstado === 'activos') {
      this.periodosService.getActivos().subscribe({
        next: (data) => {
          this.periodos = data;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error:', error);
          this.loading = false;
        }
      });
    } else {
      this.periodosService.getAll().subscribe({
        next: (data) => {
          if (this.filtroEstado === 'finalizados') {
            this.periodos = data.filter((p: any) => p.estado === 'Finalizado');
          } else {
            this.periodos = data;
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error:', error);
          this.loading = false;
        }
      });
    }
  }

  cambiarFiltro(estado: string): void {
    this.filtroEstado = estado;
    this.loadPeriodos();
  }

  calcularProgreso(periodo: any): number {
    if (!periodo.fechaInicio || !periodo.fechaCosechaEsperada) return 0;

    const hoy = new Date();
    const inicio = new Date(periodo.fechaInicio);
    const fin = new Date(periodo.fechaCosechaEsperada);

    if (hoy < inicio) return 0;
    if (hoy > fin) return 100;

    const totalDias = fin.getTime() - inicio.getTime();
    const diasTranscurridos = hoy.getTime() - inicio.getTime();

    return Math.round((diasTranscurridos / totalDias) * 100);
  }

  getEstadoBadgeClass(estado: string): string {
    switch (estado) {
      case 'En Curso':
        return 'badge-success';
      case 'Finalizado':
        return 'badge-secondary';
      case 'Cancelado':
        return 'badge-danger';
      default:
        return 'badge-info';
    }
  }
}
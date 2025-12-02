import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PeriodosSiembraService } from '../../services/periodos-siembra.service';

@Component({
  selector: 'app-periodo-siembra-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './periodo-siembra-detail.component.html',
  styleUrls: ['./periodo-siembra-detail.component.css']
})
export class PeriodoSiembraDetailComponent implements OnInit {

  // Services
  private service = inject(PeriodosSiembraService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Data
  periodo: any = null;
  loading: boolean = false;
  error: string = '';

  // Costos calculados
  costos = {
    total: 0,
    porHectarea: 0
  };

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    
    if (!id || isNaN(id)) {
      this.error = 'ID de período inválido';
      return;
    }

    this.cargarPeriodo(id);
  }

  /**
   * Carga el período desde el backend
   */
  cargarPeriodo(id: number): void {
    this.loading = true;
    this.error = '';

    this.service.getById(id).subscribe({
      next: (data) => {
        console.log('✅ Período cargado:', data);
        this.periodo = data;
        this.calcularCostos();
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error al cargar período:', error);
        this.error = 'No se pudo cargar el período de siembra';
        this.loading = false;
      }
    });
  }

  /**
   * Calcula los costos del período
   * Si el backend ya devuelve costos, los usa; sino los calcula
   */
  calcularCostos(): void {
    if (!this.periodo) return;

    // Si el backend ya devuelve costos, usarlos
    if (this.periodo.costoTotal !== undefined) {
      this.costos.total = this.periodo.costoTotal || 0;
    }

    // Calcular costo por hectárea
    if (this.costos.total > 0 && this.periodo.hectareasSembradas > 0) {
      this.costos.porHectarea = this.costos.total / this.periodo.hectareasSembradas;
    } else {
      this.costos.porHectarea = 0;
    }

    console.log('💰 Costos calculados:', this.costos);
  }

  /**
   * Calcula el progreso del período en porcentaje
   */
  calcularProgreso(): number {
    if (!this.periodo || !this.periodo.fechaInicio || !this.periodo.fechaCosechaEsperada) {
      return 0;
    }

    const hoy = new Date();
    const inicio = new Date(this.periodo.fechaInicio);
    const fin = new Date(this.periodo.fechaCosechaEsperada);

    // Si aún no ha comenzado
    if (hoy < inicio) {
      return 0;
    }

    // Si ya pasó la fecha de cosecha
    if (hoy > fin) {
      return 100;
    }

    // Calcular progreso
    const totalDias = fin.getTime() - inicio.getTime();
    const diasTranscurridos = hoy.getTime() - inicio.getTime();
    const progreso = Math.round((diasTranscurridos / totalDias) * 100);

    return Math.max(0, Math.min(100, progreso));
  }

  /**
   * Vuelve al dashboard de reportes
   */
  volver(): void {
    this.router.navigate(['/reportes']);
  }
}
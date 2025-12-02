import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
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
  filtroEstado: string = 'activos'; // Por defecto muestra solo activos

  constructor(
    private periodosService: PeriodosSiembraService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPeriodos();
  }

  /**
   * Carga los períodos según el filtro seleccionado
   */
  loadPeriodos(): void {
    this.loading = true;

    if (this.filtroEstado === 'activos') {
      // Cargar solo períodos activos
      this.periodosService.getActivos().subscribe({
        next: (data) => {
          this.periodos = data;
          this.loading = false;
          console.log('✅ Períodos activos cargados:', data);
        },
        error: (error) => {
          console.error('❌ Error al cargar períodos activos:', error);
          this.loading = false;
        }
      });
    } else {
      // Cargar todos y filtrar
      this.periodosService.getAll().subscribe({
        next: (data) => {
          if (this.filtroEstado === 'finalizados') {
            this.periodos = data.filter((p: any) => p.estado === 'Finalizado');
          } else {
            this.periodos = data;
          }
          this.loading = false;
          console.log('✅ Períodos cargados:', data);
        },
        error: (error) => {
          console.error('❌ Error al cargar períodos:', error);
          this.loading = false;
        }
      });
    }
  }

  /**
   * Cambia el filtro y recarga los períodos
   */
  cambiarFiltro(estado: string): void {
    this.filtroEstado = estado;
    this.loadPeriodos();
  }

  /**
   * MÉTODO PRINCIPAL: Navega al detalle del período
   * Redirige a la página de la parcela asociada
   */
  verDetalle(periodoId: number): void {
    console.log('🔍 Ver detalle clickeado. ID del período:', periodoId);
    
    // Buscar el período en el array
    const periodo = this.periodos.find(p => p.id === periodoId);
    console.log('📋 Período encontrado:', periodo);
    
    if (periodo && periodo.parcelaId) {
      console.log('✅ Navegando a parcela ID:', periodo.parcelaId);
      this.router.navigate(['/parcelas', periodo.parcelaId]);
    } else if (periodo && !periodo.parcelaId) {
      console.error('❌ El período no tiene parcelaId:', periodo);
      alert('Este período no tiene una parcela asociada.');
    } else {
      console.error('❌ No se encontró el período con ID:', periodoId);
      console.error('📊 IDs disponibles:', this.periodos.map(p => ({ 
        id: p.id, 
        cultivo: p.cultivo?.nombre,
        parcelaId: p.parcelaId 
      })));
      alert('No se puede ver el detalle. Período no encontrado.');
    }
  }

  /**
   * Calcula el progreso del ciclo de cultivo
   */
  calcularProgreso(periodo: any): number {
    if (!periodo.fechaInicio || !periodo.fechaCosechaEsperada) return 0;

    const hoy = new Date();
    const inicio = new Date(periodo.fechaInicio);
    const fin = new Date(periodo.fechaCosechaEsperada);

    // Si aún no ha comenzado
    if (hoy < inicio) return 0;
    
    // Si ya pasó la fecha de cosecha
    if (hoy > fin) return 100;

    // Calcular progreso
    const totalDias = fin.getTime() - inicio.getTime();
    const diasTranscurridos = hoy.getTime() - inicio.getTime();

    return Math.round((diasTranscurridos / totalDias) * 100);
  }

  /**
   * Retorna la clase CSS según el estado del período
   */
  getEstadoBadgeClass(estado: string): string {
    switch (estado) {
      case 'En Curso':
        return 'badge-en-curso';
      case 'Finalizado':
        return 'badge-finalizado';
      case 'Cancelado':
        return 'badge-cancelado';
      default:
        return 'badge-en-curso';
    }
  }
}
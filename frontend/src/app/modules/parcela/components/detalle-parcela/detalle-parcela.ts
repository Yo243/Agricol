import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ParcelasService } from '../../services/parcelas.service';
import { FormPeriodoComponent } from '../form-periodo/form-periodo.component';
import { FormAplicacionComponent } from '../form-aplicacion/form-aplicacion.component';
import { TrazabilidadComponent } from '../trazabilidad/trazabilidad.component';
import {
  Parcela,
  PeriodoSiembra,
  AplicacionParcela,
  getEstadoParcelaColor,
  getEstadoPeriodoColor,
  formatearHectareas,
  formatearCosto
} from '../../../../models/parcelas.model';

@Component({
  selector: 'app-detalle-parcela',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    FormPeriodoComponent, 
    FormAplicacionComponent,
    TrazabilidadComponent
  ],
  templateUrl: './detalle-parcela.component.html',
  styleUrl: './detalle-parcela.component.css'
})
export class DetalleParcelaComponent implements OnInit {
  parcela?: Parcela;
  periodos: PeriodoSiembra[] = [];
  aplicaciones: AplicacionParcela[] = [];
  loading = false;
  
  // Tabs
  tabActiva: 'periodos' | 'aplicaciones' | 'trazabilidad' = 'periodos';
  
  // Modales
  mostrarFormPeriodo = false;
  mostrarFormAplicacion = false;
  
  // Estadísticas
  periodosActivos = 0;
  totalAplicaciones = 0;
  costoTotal = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private parcelasService: ParcelasService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.cargarParcela(id);
    }
  }

  cargarParcela(id: number) {
    this.loading = true;
    
    this.parcelasService.getParcelaById(id).subscribe({
      next: (parcela) => {
        this.parcela = parcela;
        this.cargarPeriodos();
        this.cargarAplicaciones();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar parcela:', error);
        alert('Error al cargar la parcela');
        this.router.navigate(['/parcelas']);
      }
    });
  }

  cargarPeriodos() {
    if (!this.parcela) return;
    
    this.parcelasService.getPeriodosSiembra(this.parcela.id).subscribe({
      next: (periodos) => {
        this.periodos = periodos;
        this.periodosActivos = periodos.filter(p => p.estado === 'En Curso').length;
        this.calcularEstadisticas();
      },
      error: (error) => console.error('Error al cargar períodos:', error)
    });
  }

  cargarAplicaciones() {
    if (!this.parcela) return;
    
    this.parcelasService.getAplicaciones(this.parcela.id).subscribe({
      next: (aplicaciones) => {
        this.aplicaciones = aplicaciones;
        this.totalAplicaciones = aplicaciones.length;
        this.calcularEstadisticas();
      },
      error: (error) => console.error('Error al cargar aplicaciones:', error)
    });
  }

  calcularEstadisticas() {
    this.costoTotal = this.aplicaciones.reduce((sum, a) => sum + a.costoTotal, 0);
  }

  cambiarTab(tab: 'periodos' | 'aplicaciones' | 'trazabilidad') {
    this.tabActiva = tab;
  }

  abrirFormPeriodo() {
    this.mostrarFormPeriodo = true;
  }

  cerrarFormPeriodo() {
    this.mostrarFormPeriodo = false;
  }

  abrirFormAplicacion() {
    this.mostrarFormAplicacion = true;
  }

  cerrarFormAplicacion() {
    this.mostrarFormAplicacion = false;
  }

  getEstadoColor(estado: any): string {
    return getEstadoParcelaColor(estado);
  }

  getEstadoPeriodoColor(estado: any): string {
    return getEstadoPeriodoColor(estado);
  }

  formatearHectareas(hectareas: number): string {
    return formatearHectareas(hectareas);
  }

  formatearCosto(costo: number): string {
    return formatearCosto(costo);
  }

  formatearFecha(fecha: Date): string {
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
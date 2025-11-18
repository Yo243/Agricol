import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ParcelasService } from '../../services/parcela.service';
import { FormParcelaComponent } from '../../components/form-parcela/form-parcela';  // ✅ CORREGIDO
import {
  Parcela,
  EstadoParcela,
  getEstadoParcelaColor,
  formatearHectareas,
  ESTADOS_PARCELA
} from '../../../../models/parcela.model';

@Component({
  selector: 'app-parcela',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, FormParcelaComponent],
  templateUrl: './parcela.component.html',
  styleUrl: './parcela.component.css'
})
export class ParcelaComponent implements OnInit {
  private parcelasService = inject(ParcelasService);

  parcelas: Parcela[] = [];
  parcelasFiltradas: Parcela[] = [];
  loading = false;
  
  // Filtros
  estadoFiltro: EstadoParcela | 'todos' = 'todos';
  busqueda = '';
  
  // Estadísticas
  totalParcelas = 0;
  superficieTotal = 0;
  parcelasActivas = 0;
  
  // Constantes para template
  ESTADOS_PARCELA = ESTADOS_PARCELA;
  
  // Modales
  mostrarFormulario = false;
  parcelaSeleccionada: Parcela | null = null;

  ngOnInit() {
    this.cargarParcelas();
  }

  cargarParcelas() {
    this.loading = true;
    this.parcelasService.getParcelas(true).subscribe({
      next: (parcelas) => {
        this.parcelas = parcelas;
        this.aplicarFiltros();
        this.calcularEstadisticas();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar parcelas:', error);
        this.loading = false;
      }
    });
  }

  aplicarFiltros() {
    let filtradas = [...this.parcelas];

    // Filtrar por estado
    if (this.estadoFiltro !== 'todos') {
      filtradas = filtradas.filter(p => p.estado === this.estadoFiltro);
    }

    // Filtrar por búsqueda
    if (this.busqueda.trim()) {
      const busq = this.busqueda.toLowerCase();
      filtradas = filtradas.filter(p =>
        p.nombre.toLowerCase().includes(busq) ||
        p.codigo.toLowerCase().includes(busq) ||
        p.ubicacion?.toLowerCase().includes(busq)
      );
    }

    this.parcelasFiltradas = filtradas;
  }

  calcularEstadisticas() {
    this.totalParcelas = this.parcelas.length;
    this.superficieTotal = this.parcelas.reduce((sum, p) => sum + p.superficieHa, 0);
    this.parcelasActivas = this.parcelas.filter(p => p.estado === 'Activa').length;
  }

  getEstadoColor(estado: EstadoParcela): string {
    return getEstadoParcelaColor(estado);
  }

  formatearHectareas(hectareas: number): string {
    return formatearHectareas(hectareas);
  }

  abrirFormulario(parcela?: Parcela) {
    this.parcelaSeleccionada = parcela || null;
    this.mostrarFormulario = true;
  }

  cerrarFormulario() {
    this.mostrarFormulario = false;
    this.parcelaSeleccionada = null;
    this.cargarParcelas();
  }

  eliminarParcela(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar esta parcela?')) {
      this.parcelasService.deleteParcela(id).subscribe({
        next: () => {
          alert('Parcela eliminada correctamente');
          this.cargarParcelas();
        },
        error: (error) => {
          console.error('Error al eliminar:', error);
          alert('Error al eliminar la parcela');
        }
      });
    }
  }
}
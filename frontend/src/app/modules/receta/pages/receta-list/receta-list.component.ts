// src/app/modules/receta/pages/receta-list/receta-list.component.ts

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// ✅ Aliases corregidos
import { Receta, Cultivo, RecetaFilters } from '../../../../models/receta.model';
import { RecetaService } from '@modules/receta/services/receta.service';

@Component({
  selector: 'app-receta-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './receta-list.component.html',
  styleUrls: ['./receta-list.component.css']
})
export class RecetaListComponent implements OnInit {

  private recetaService = inject(RecetaService);
  private router = inject(Router);

  recetas: Receta[] = [];
  cultivos: Cultivo[] = [];
  etapas: string[] = [];

  filters: RecetaFilters = {
    activo: true
  };

  searchTerm = '';
  loading = false;
  error = '';

  ngOnInit(): void {
    this.loadCultivos();
    this.loadEtapas();
    this.loadRecetas();
  }

  // =====================
  //   CARGA DE DATOS
  // =====================

  loadRecetas(): void {
    this.loading = true;
    this.error = '';

    this.recetaService.getRecetas(this.filters).subscribe({
      next: (data) => {
        this.recetas = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar recetas:', err);
        this.error = 'Error al cargar recetas';
        this.loading = false;
      }
    });
  }

  loadCultivos(): void {
    this.recetaService.getCultivos().subscribe({
      next: (data) => {
        this.cultivos = data;
      },
      error: (err) => {
        console.error('Error al cargar cultivos:', err);
      }
    });
  }

  loadEtapas(): void {
    this.recetaService.getEtapas().subscribe({
      next: (data) => {
        this.etapas = data;
      },
      error: (err) => {
        console.error('Error al cargar etapas:', err);
      }
    });
  }

  // =====================
  //    FILTROS + BUSCAR
  // =====================

  onSearch(): void {
    this.filters.search = this.searchTerm;
    this.loadRecetas();
  }

  onFilterChange(): void {
    this.loadRecetas();
  }

  clearFilters(): void {
    this.filters = { activo: true };
    this.searchTerm = '';
    this.loadRecetas();
  }

  // =====================
  //     ACCIONES
  // =====================

  viewReceta(id: number): void {
    this.router.navigate(['/receta', id]);
  }

  editReceta(id: number): void {
    this.router.navigate(['/receta/editar', id]);
  }

  createReceta(): void {
    this.router.navigate(['/receta/nueva']);
  }

  deleteReceta(receta: Receta): void {
    if (!receta.id) return;

    if (confirm(`¿Seguro que deseas eliminar la receta "${receta.nombre}"?`)) {
      this.recetaService.deleteReceta(receta.id).subscribe({
        next: () => {
          alert('Receta eliminada exitosamente');
          this.loadRecetas();
        },
        error: (err) => {
          console.error('Error al eliminar:', err);
          alert('Error al eliminar la receta');
        }
      });
    }
  }

  // =====================
  //     HELPERS
  // =====================

  getCultivoNombre(cultivoId: number): string {
    return this.cultivos.find(c => c.id === cultivoId)?.nombre ?? 'Desconocido';
  }
}

// src/app/modules/receta/pages/receta-list/receta-list.component.ts

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

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

  // ✅ feedback “bonito” (no alerts nativos)
  feedbackMessage = '';
  feedbackType: 'success' | 'error' | 'info' | '' = '';
  private feedbackTimeout: any;

  // ✅ modal de confirmación para eliminar
  confirmModalVisible = false;
  recetaAEliminar: Receta | null = null;
  deleteLoading = false;

  ngOnInit(): void {
    this.loadCultivos();
    this.loadEtapas();
    this.loadRecetas();
  }

  // =====================
  //   CARGA DE DATOS
  // =====================

  loadRecetas(): void {
    // Normalizar filtros antes de mandar al backend
    this.normalizeFilters();

    this.loading = true;
    this.error = '';

    this.recetaService.getRecetas(this.filters).subscribe({
      next: (data) => {
        this.recetas = Array.isArray(data) ? data : [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar recetas:', err);
        this.error = err?.error?.message || 'Error al cargar recetas';
        this.loading = false;
      }
    });
  }

  loadCultivos(): void {
    this.recetaService.getCultivos().subscribe({
      next: (data) => {
        this.cultivos = Array.isArray(data) ? data : [];
      },
      error: (err) => {
        console.error('Error al cargar cultivos:', err);
        this.showFeedback('No se pudieron cargar los cultivos.', 'error');
      }
    });
  }

  loadEtapas(): void {
    this.recetaService.getEtapas().subscribe({
      next: (data) => {
        this.etapas = Array.isArray(data) ? data : [];
      },
      error: (err) => {
        console.error('Error al cargar etapas:', err);
        this.showFeedback('No se pudieron cargar las etapas de cultivo.', 'error');
      }
    });
  }

  // =====================
  //    FILTROS + BUSCAR
  // =====================

  onSearch(): void {
    const term = this.searchTerm.trim();

    // ✅ validación sencilla para no pegarle al backend con basura
    if (term && term.length < 2) {
      this.error = 'Escribe al menos 2 caracteres para buscar.';
      return;
    }

    this.error = '';
    this.filters.search = term || undefined;
    this.loadRecetas();
  }

  onFilterChange(): void {
    this.error = '';
    this.loadRecetas();
  }

  clearFilters(): void {
    this.filters = { activo: true };
    this.searchTerm = '';
    this.error = '';
    this.loadRecetas();
  }

  // =====================
  //     ACCIONES
  // =====================

  viewReceta(id: number): void {
    if (!id) return;
    this.router.navigate(['/receta', id]);
  }

  editReceta(id: number): void {
    if (!id) return;
    this.router.navigate(['/receta/editar', id]);
  }

  createReceta(): void {
    this.router.navigate(['/receta/nueva']);
  }

  // Abrir modal de confirmación
  openDeleteModal(receta: Receta): void {
    if (!receta || !receta.id) return;

    this.recetaAEliminar = receta;
    this.confirmModalVisible = true;
    this.deleteLoading = false;
  }

  // Cerrar modal sin hacer nada
  closeDeleteModal(): void {
    this.confirmModalVisible = false;
    this.recetaAEliminar = null;
    this.deleteLoading = false;
  }

  // Confirmar eliminación (se llama desde el modal)
  confirmDeleteReceta(): void {
    if (!this.recetaAEliminar?.id) return;

    this.deleteLoading = true;

    this.recetaService.deleteReceta(this.recetaAEliminar.id).subscribe({
      next: () => {
        this.showFeedback('Receta eliminada exitosamente.', 'success');
        this.closeDeleteModal();
        this.loadRecetas();
      },
      error: (err) => {
        console.error('Error al eliminar:', err);
        this.showFeedback(
          err?.error?.message || 'Error al eliminar la receta.',
          'error'
        );
        this.deleteLoading = false;
      }
    });
  }

  // =====================
  //     HELPERS
  // =====================

  getCultivoNombre(cultivoId: number): string {
    return this.cultivos.find(c => c.id === cultivoId)?.nombre ?? 'Desconocido';
  }

  private normalizeFilters(): void {
    // Normalizar cultivoId a number | undefined
    if (this.filters.cultivoId !== undefined && this.filters.cultivoId !== null) {
      const val = Number(this.filters.cultivoId);
      this.filters.cultivoId = Number.isFinite(val) && val > 0 ? val : undefined;
    }

    // Normalizar activo cuando viene como string desde el select
    if (this.filters.activo === 'true' as any) this.filters.activo = true;
    if (this.filters.activo === 'false' as any) this.filters.activo = false;
  }

  private showFeedback(
    message: string,
    type: 'success' | 'error' | 'info' = 'info'
  ): void {
    this.feedbackMessage = message;
    this.feedbackType = type;

    if (this.feedbackTimeout) {
      clearTimeout(this.feedbackTimeout);
    }

    this.feedbackTimeout = setTimeout(() => {
      this.feedbackMessage = '';
      this.feedbackType = '';
    }, 3500);
  }
}

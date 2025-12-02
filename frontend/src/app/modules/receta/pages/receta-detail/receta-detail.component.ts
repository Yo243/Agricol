// src/app/modules/receta/pages/receta-detail/receta-detail.component.ts

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

// 👉 Usar alias correctos
import { Receta } from '../../../../models/receta.model';
import { RecetaService } from '@modules/receta/services/receta.service';

@Component({
  selector: 'app-receta-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './receta-detail.component.html',
  styleUrls: ['./receta-detail.component.css']
})
export class RecetaDetailComponent implements OnInit {

  private recetaService = inject(RecetaService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  receta?: Receta;
  loading = false;
  error = '';
  hectareasSimulacion = 10;

  // ✅ Feedback tipo "localhost" pero bonito
  feedbackMessage = '';
  feedbackType: 'success' | 'error' | 'info' | '' = '';

  // ✅ Modal de confirmación de borrado
  confirmModalVisible = false;
  deleteLoading = false;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) this.loadReceta(id);
  }

  loadReceta(id: number): void {
    this.loading = true;
    this.error = '';

    this.recetaService.getRecetaById(id).subscribe({
      next: (data) => {
        this.receta = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar receta:', err);
        this.error = 'No se pudo cargar la receta';
        this.showFeedback('No se pudo cargar la receta', 'error');
        this.loading = false;
      }
    });
  }

  calcularCantidad(dosis: number): number {
    return this.recetaService.calcularCantidadInsumo(dosis, this.hectareasSimulacion);
  }

  calcularCostoDetalle(insumo: any, dosis: number): number {
    return (insumo?.costoUnitario ?? 0) * dosis;
  }

  editReceta(): void {
    if (this.receta?.id) {
      this.router.navigate(['/receta/editar', this.receta.id]);
    }
  }

  backToList(): void {
    this.router.navigate(['/receta']);
  }

  // ======================
  //  MODAL ELIMINAR
  // ======================

  openDeleteModal(): void {
    if (!this.receta?.id) return;
    this.confirmModalVisible = true;
  }

  closeDeleteModal(): void {
    this.confirmModalVisible = false;
    this.deleteLoading = false;
  }

  confirmDeleteReceta(): void {
    if (!this.receta?.id) return;

    this.deleteLoading = true;

    this.recetaService.deleteReceta(this.receta.id).subscribe({
      next: () => {
        this.deleteLoading = false;
        this.confirmModalVisible = false;
        this.showFeedback('Receta eliminada exitosamente', 'success');

        // Navegamos al listado
        this.router.navigate(['/receta']);
      },
      error: (err) => {
        console.error('Error al eliminar:', err);
        this.deleteLoading = false;
        this.confirmModalVisible = false;
        this.showFeedback('No se pudo eliminar la receta', 'error');
      }
    });
  }

  // ======================
  //  FEEDBACK HELPER
  // ======================

  private showFeedback(
    message: string,
    type: 'success' | 'error' | 'info' = 'info'
  ): void {
    this.feedbackMessage = message;
    this.feedbackType = type;

    // Se desvanece solo después de unos segundos
    setTimeout(() => {
      this.feedbackMessage = '';
      this.feedbackType = '';
    }, 3500);
  }
}

// src/app/modules/parcela/components/form-periodo/form-periodo.ts

import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ParcelasService } from '../../services/parcela.service';
import { Parcela, Cultivo, CreatePeriodoSiembraDto } from '../../../../models/parcela.model';

@Component({
  selector: 'app-form-periodo',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './form-periodo.html',
  styleUrls: ['./form-periodo.css']
})
export class FormPeriodoComponent implements OnInit {

  private parcelasService = inject(ParcelasService);

  @Input() parcelaId?: number;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<void>();

  parcelas: Parcela[] = [];
  cultivos: Cultivo[] = [];
  loading = false;
  loadingData = false;

  // ========== MENSAJES CENTRADOS Y BONITOS ==========
  error = '';
  success = '';
  showSuccessModal = false;
  successMessage = '';

  formData: CreatePeriodoSiembraDto = {
    parcelaId: 0,
    cultivoId: 0,
    fechaInicio: new Date().toISOString().split('T')[0],
    hectareasSembradas: 0,
    rendimientoEsperado: 0,
    observaciones: ''
  };

  ngOnInit() {
    this.cargarDatos();

    if (this.parcelaId) {
      this.formData.parcelaId = this.parcelaId;
    }
  }

  cargarDatos() {
    this.loadingData = true;

    // Parcelas activas
    this.parcelasService.getParcelas(true, 'Activa').subscribe({
      next: (parcelas) => {
        this.parcelas = parcelas;
      },
      error: (error) => {
        console.error('Error al cargar parcelas:', error);
      }
    });

    // Cultivos
    this.parcelasService.getCultivos().subscribe({
      next: (cultivos) => {
        console.log('Cultivos recibidos en componente:', cultivos);
        this.cultivos = cultivos;
        this.loadingData = false;
      },
      error: (error) => {
        console.error('Error al cargar cultivos:', error);
        this.loadingData = false;
      }
    });
  }

  onParcelaChange() {
    const parcela = this.parcelas.find(p => p.id === this.formData.parcelaId);
    if (parcela && this.formData.hectareasSembradas === 0) {
      this.formData.hectareasSembradas = parcela.superficieHa;
    }
  }

  onCultivoChange() {
    const cultivo = this.cultivos.find(c => c.id === this.formData.cultivoId);
    if (cultivo) {
      // rendimientoEsperado en toneladas totales
      this.formData.rendimientoEsperado = cultivo.rendimientoEsperado
        ? cultivo.rendimientoEsperado * this.formData.hectareasSembradas
        : 0;

      if (cultivo.diasCiclo) {
        const fechaInicio = new Date(this.formData.fechaInicio);
        fechaInicio.setDate(fechaInicio.getDate() + cultivo.diasCiclo);
        this.formData.fechaCosechaEsperada = fechaInicio.toISOString().split('T')[0];
      }
    }
  }

  guardar() {
    if (!this.validarFormulario()) return;

    this.loading = true;
    this.error = '';
    this.success = '';

    this.parcelasService.createPeriodoSiembra(this.formData).subscribe({
      next: () => {
        this.success = '✓ Período de siembra creado correctamente';
        this.showSuccessModal = true;
        this.successMessage = 'El período de siembra ha sido creado exitosamente.';
        this.onSave.emit();
        setTimeout(() => {
          this.cerrar();
        }, 1500);
      },
      error: (error) => {
        console.error('Error al crear período:', error);
        this.error = 'Error al crear el período de siembra. Intenta de nuevo.';
        this.loading = false;
      }
    });
  }

  validarFormulario(): boolean {
    if (!this.formData.parcelaId) {
      this.error = 'Selecciona una parcela';
      return false;
    }

    if (!this.formData.cultivoId) {
      this.error = 'Selecciona un cultivo';
      return false;
    }

    if (this.formData.hectareasSembradas <= 0) {
      this.error = 'Las hectáreas sembradas deben ser mayor a 0';
      return false;
    }

    const parcela = this.parcelas.find(p => p.id === this.formData.parcelaId);
    if (parcela && this.formData.hectareasSembradas > parcela.superficieHa) {
      this.error = `Las hectáreas sembradas no pueden ser mayor a ${parcela.superficieHa} ha`;
      return false;
    }

    this.error = '';
    return true;
  }

  cerrar() {
    this.error = '';
    this.success = '';
    this.showSuccessModal = false;
    this.onClose.emit();
  }
}

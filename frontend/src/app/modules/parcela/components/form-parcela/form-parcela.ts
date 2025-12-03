import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ParcelasService } from '../../services/parcela.service';
import {
  Parcela,
  CreateParcelaDto,
  UpdateParcelaDto,
  EstadoParcela,
  ESTADOS_PARCELA,
  TIPOS_SUELO,
  SISTEMAS_RIEGO
} from '../../../../models/parcela.model';

@Component({
  selector: 'app-form-parcela',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './form-parcela.html',
  styleUrls: ['./form-parcela.css']
})
export class FormParcelaComponent implements OnInit {

  private parcelasService = inject(ParcelasService);

  @Input() parcela?: Parcela;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<void>();

  loading = false;
  modoEdicion = false;
  
  // ========== MENSAJES CENTRADOS Y BONITOS ==========
  error = '';
  success = '';
  showSuccessModal = false;
  successMessage = '';

  ESTADOS_PARCELA = ESTADOS_PARCELA;
  TIPOS_SUELO = TIPOS_SUELO;
  SISTEMAS_RIEGO = SISTEMAS_RIEGO;

  formData = {
    nombre: '',
    codigo: '',
    superficieHa: 0,
    ubicacion: '',
    coordenadas: '',
    coordenadasGPS: '',
    tipoSuelo: '',
    sistemaRiego: '',
    estado: 'Activa' as EstadoParcela,
    observaciones: ''
  };

  ngOnInit() {
    if (this.parcela) {
      this.modoEdicion = true;
      this.cargarDatosParcela();
    } else {
      this.generarCodigo();
    }
  }

  cargarDatosParcela() {
    if (this.parcela) {
      this.formData = {
        nombre: this.parcela.nombre,
        codigo: this.parcela.codigo,
        superficieHa: this.parcela.superficieHa,
        ubicacion: this.parcela.ubicacion || '',
        coordenadas: this.parcela.coordenadas || '',
        coordenadasGPS: this.parcela.coordenadas || '',
        tipoSuelo: this.parcela.tipoSuelo || '',
        sistemaRiego: this.parcela.sistemaRiego || '',
        estado: this.parcela.estado as EstadoParcela,
        observaciones: this.parcela.observaciones || ''
      };
    }
  }

  generarCodigo() {
    const timestamp = Date.now().toString().slice(-6);
    this.formData.codigo = `PAR-${timestamp}`;
  }

  guardar() {
    if (!this.validarFormulario()) return;

    this.loading = true;
    this.error = '';
    this.success = '';

    const dataParaEnviar: CreateParcelaDto = {
      nombre: this.formData.nombre,
      codigo: this.formData.codigo,
      superficieHa: this.formData.superficieHa,
      ubicacion: this.formData.ubicacion,
      coordenadas: this.formData.coordenadas,
      tipoSuelo: this.formData.tipoSuelo,
      sistemaRiego: this.formData.sistemaRiego,
      estado: this.formData.estado,
      observaciones: this.formData.observaciones
    };

    if (this.modoEdicion && this.parcela) {
      const updateData: UpdateParcelaDto = { ...dataParaEnviar };
      this.parcelasService.updateParcela(this.parcela.id, updateData).subscribe({
        next: () => {
          this.success = '✓ Parcela actualizada correctamente';
          this.showSuccessModal = true;
          this.successMessage = 'La parcela ha sido actualizada exitosamente.';
          this.onSave.emit();
          setTimeout(() => {
            this.cerrar();
          }, 1500);
        },
        error: (error) => {
          console.error('Error al actualizar:', error);
          this.error = 'Error al actualizar la parcela. Intenta de nuevo.';
          this.loading = false;
        }
      });
    } else {
      this.parcelasService.createParcela(dataParaEnviar).subscribe({
        next: () => {
          this.success = '✓ Parcela creada correctamente';
          this.showSuccessModal = true;
          this.successMessage = 'La nueva parcela ha sido creada exitosamente.';
          this.onSave.emit();
          setTimeout(() => {
            this.cerrar();
          }, 1500);
        },
        error: (error) => {
          console.error('Error al crear:', error);
          this.error = 'Error al crear la parcela. Intenta de nuevo.';
          this.loading = false;
        }
      });
    }
  }

  validarFormulario(): boolean {
    if (!this.formData.nombre.trim()) {
      this.error = 'El nombre de la parcela es requerido';
      return false;
    }

    if (this.formData.superficieHa <= 0) {
      this.error = 'La superficie debe ser mayor a 0 hectáreas';
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

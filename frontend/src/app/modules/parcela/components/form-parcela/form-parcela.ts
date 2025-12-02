import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';

import { FormsModule } from '@angular/forms';
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
  imports: [FormsModule],
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
          alert('Parcela actualizada correctamente');
          this.onSave.emit();
          this.cerrar();
        },
        error: (error) => {
          console.error('Error al actualizar:', error);
          alert('Error al actualizar la parcela');
          this.loading = false;
        }
      });
    } else {
      this.parcelasService.createParcela(dataParaEnviar).subscribe({
        next: () => {
          alert('Parcela creada correctamente');
          this.onSave.emit();
          this.cerrar();
        },
        error: (error) => {
          console.error('Error al crear:', error);
          alert('Error al crear la parcela');
          this.loading = false;
        }
      });
    }
  }

  validarFormulario(): boolean {
    if (!this.formData.nombre.trim()) {
      alert('El nombre es requerido');
      return false;
    }

    if (this.formData.superficieHa <= 0) {
      alert('La superficie debe ser mayor a 0');
      return false;
    }

    return true;
  }

  cerrar() {
    this.onClose.emit();
  }
}

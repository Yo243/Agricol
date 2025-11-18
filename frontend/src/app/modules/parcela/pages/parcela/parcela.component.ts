import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ParcelasService } from '../../services/parcelas.service';
import { Parcela, CreateParcelaDto, ESTADOS_PARCELA, EstadoParcela } from '../../../../models/parcelas.model';

@Component({
  selector: 'app-form-parcela',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form-parcela.component.html',
  styleUrl: './form-parcela.component.css'
})
export class FormParcelaComponent implements OnInit {
  @Input() parcela?: Parcela;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<void>();

  formData: CreateParcelaDto = {
    nombre: '',
    superficieHa: 0,
    ubicacion: '',
    coordenadas: '',
    tipoSuelo: '',
    sistemaRiego: '',
    estado: 'Activa',
    observaciones: ''
  };

  ESTADOS_PARCELA = ESTADOS_PARCELA;
  loading = false;
  modoEdicion = false;

  constructor(private parcelasService: ParcelasService) {}

  ngOnInit() {
    if (this.parcela) {
      this.modoEdicion = true;
      this.formData = {
        codigo: this.parcela.codigo,
        nombre: this.parcela.nombre,
        superficieHa: this.parcela.superficieHa,
        ubicacion: this.parcela.ubicacion,
        coordenadas: this.parcela.coordenadas,
        tipoSuelo: this.parcela.tipoSuelo,
        sistemaRiego: this.parcela.sistemaRiego,
        estado: this.parcela.estado,
        observaciones: this.parcela.observaciones
      };
    }
  }

  guardar() {
    if (!this.validarFormulario()) {
      return;
    }

    this.loading = true;

    const request = this.modoEdicion
      ? this.parcelasService.updateParcela(this.parcela!.id, this.formData)
      : this.parcelasService.createParcela(this.formData);

    request.subscribe({
      next: () => {
        alert(this.modoEdicion ? 'Parcela actualizada correctamente' : 'Parcela creada correctamente');
        this.onSave.emit();
        this.cerrar();
      },
      error: (error) => {
        console.error('Error al guardar parcela:', error);
        alert('Error al guardar la parcela');
        this.loading = false;
      }
    });
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
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ParcelasService } from '../../../services/parcelas.service';  // ← CAMBIAR
import { HttpClient } from '@angular/common/http';
import { Parcela, Cultivo, CreatePeriodoSiembraDto } from '../../../../../models/parcelas.model';  // ← CAMBIAR

@Component({
  selector: 'app-form-periodo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form-periodo.component.html',
  styleUrl: './form-periodo.component.css'
})
export class FormPeriodoComponent implements OnInit {
  @Input() parcelaId?: number;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<void>();

  parcelas: Parcela[] = [];
  cultivos: Cultivo[] = [];
  loading = false;
  loadingData = false;

  formData: CreatePeriodoSiembraDto = {
    parcelaId: 0,
    cultivoId: 0,
    fechaInicio: new Date().toISOString().split('T')[0],
    hectareasSembradas: 0,
    rendimientoEsperado: 0,
    observaciones: ''
  };

  constructor(
    private parcelasService: ParcelasService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.cargarDatos();
    if (this.parcelaId) {
      this.formData.parcelaId = this.parcelaId;
    }
  }

  cargarDatos() {
    this.loadingData = true;
    
    // Cargar parcelas
    this.parcelasService.getParcelas(true, 'Activa').subscribe({
      next: (parcelas) => {
        this.parcelas = parcelas;
      },
      error: (error) => console.error('Error al cargar parcelas:', error)
    });

    // Cargar cultivos
    this.http.get<Cultivo[]>('http://localhost:3000/api/cultivos').subscribe({
      next: (cultivos) => {
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
      this.formData.rendimientoEsperado = cultivo.rendimientoEsperado 
        ? cultivo.rendimientoEsperado * this.formData.hectareasSembradas 
        : 0;
      
      // Calcular fecha esperada de cosecha
      if (cultivo.diasCiclo) {
        const fechaInicio = new Date(this.formData.fechaInicio);
        fechaInicio.setDate(fechaInicio.getDate() + cultivo.diasCiclo);
        this.formData.fechaCosechaEsperada = fechaInicio.toISOString().split('T')[0];
      }
    }
  }

  guardar() {
    if (!this.validarFormulario()) {
      return;
    }

    this.loading = true;

    this.parcelasService.createPeriodoSiembra(this.formData).subscribe({
      next: () => {
        alert('Período de siembra creado correctamente');
        this.onSave.emit();
        this.cerrar();
      },
      error: (error) => {
        console.error('Error al crear período:', error);
        alert('Error al crear el período de siembra');
        this.loading = false;
      }
    });
  }

  validarFormulario(): boolean {
    if (!this.formData.parcelaId) {
      alert('Selecciona una parcela');
      return false;
    }

    if (!this.formData.cultivoId) {
      alert('Selecciona un cultivo');
      return false;
    }

    if (this.formData.hectareasSembradas <= 0) {
      alert('Las hectáreas sembradas deben ser mayor a 0');
      return false;
    }

    const parcela = this.parcelas.find(p => p.id === this.formData.parcelaId);
    if (parcela && this.formData.hectareasSembradas > parcela.superficieHa) {
      alert(`Las hectáreas sembradas no pueden ser mayor a ${parcela.superficieHa} ha`);
      return false;
    }

    return true;
  }

  cerrar() {
    this.onClose.emit();
  }
}
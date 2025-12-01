import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ParcelasService } from '../../services/parcela.service';
import {
  PeriodoSiembra,
  CreateAplicacionDto,
  TIPOS_APLICACION,
  TipoAplicacion,
} from '../../../../models/parcela.model';

interface Insumo {
  id: number;
  nombre: string;
  codigo?: string;
  stockActual: number;
  unidadMedida: string;
  costoUnitario: number;
}

interface InsumoAplicacion {
  insumoId: number;
  cantidad: number;
  dosisPorHectarea: number;
  nombre?: string;
  unidadMedida?: string;
  stockDisponible?: number;
}

@Component({
  selector: 'app-form-aplicacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form-aplicacion.html',
  styleUrls: ['./form-aplicacion.css'],
})
export class FormAplicacionComponent implements OnInit {
  private parcelasService = inject(ParcelasService);
  private http = inject(HttpClient);

  @Input() periodoId?: number;
  @Input() parcelaId?: number;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<void>();

  periodos: PeriodoSiembra[] = [];
  insumos: Insumo[] = [];
  insumosSeleccionados: InsumoAplicacion[] = [];

  TIPOS_APLICACION = TIPOS_APLICACION;
  loading = false;
  loadingData = false;

  formData: CreateAplicacionDto = {
    periodoSiembraId: 0,
    parcelaId: 0,
    fecha: new Date().toISOString().split('T')[0],
    hectareasAplicadas: 0,
    tipoAplicacion: 'Fertilización' as TipoAplicacion,
    insumos: [],
    responsable: '',
    observaciones: '',
  };

  // ahora trabajamos con number | null
  insumoSeleccionado: number | null = null;

  ngOnInit() {
    this.cargarDatos();

    if (this.periodoId) {
      this.formData.periodoSiembraId = this.periodoId;
    }
    if (this.parcelaId) {
      this.formData.parcelaId = this.parcelaId;
    }
  }

  // ================= CARGA INICIAL =================

  cargarDatos() {
    this.loadingData = true;

    // Períodos activos
    this.parcelasService.getPeriodosSiembra(undefined, 'En Curso').subscribe({
      next: (periodos) => {
        this.periodos = periodos;
        console.log('Períodos recibidos:', periodos);

        if (this.periodoId) {
          this.formData.periodoSiembraId = this.periodoId;
          this.onPeriodoChange();
        }
      },
      error: (error) => {
        console.error('Error al cargar períodos:', error);
      },
    });

    // Insumos
    this.http.get<any>('http://localhost:3000/api/inventario').subscribe({
      next: (resp) => {
        console.log('Insumos respuesta cruda:', resp);
        const items: Insumo[] = Array.isArray(resp) ? resp : resp?.data ?? [];
        console.log('Insumos procesados:', items);

        this.insumos = items.filter((i) => i.stockActual > 0);
        this.loadingData = false;
      },
      error: (error) => {
        console.error('Error al cargar insumos:', error);
        this.loadingData = false;
      },
    });
  }

  onPeriodoChange() {
    const periodo = this.periodos.find(
      (p) => p.id === this.formData.periodoSiembraId
    );
    if (periodo) {
      this.formData.parcelaId = periodo.parcelaId;
      if (!this.formData.hectareasAplicadas) {
        this.formData.hectareasAplicadas = periodo.hectareasSembradas;
      }
    }
  }

  // ================= INSUMOS =================

  agregarInsumo() {
    console.log('👉 agregarInsumo(), seleccionado:', this.insumoSeleccionado);

    const selectedId =
      this.insumoSeleccionado != null ? Number(this.insumoSeleccionado) : 0;

    if (!selectedId) {
      alert('Selecciona un insumo');
      return;
    }

    const insumo = this.insumos.find((i) => i.id === selectedId);
    if (!insumo) {
      console.error('No se encontró el insumo con id', selectedId);
      return;
    }

    const yaExiste = this.insumosSeleccionados.find(
      (i) => i.insumoId === selectedId
    );
    if (yaExiste) {
      alert('Este insumo ya fue agregado');
      return;
    }

    const nuevo: InsumoAplicacion = {
      insumoId: insumo.id,
      cantidad: 0,
      dosisPorHectarea: 0,
      nombre: insumo.nombre,
      unidadMedida: insumo.unidadMedida,
      stockDisponible: insumo.stockActual,
    };

    this.insumosSeleccionados = [...this.insumosSeleccionados, nuevo];

    console.log('✅ insumosSeleccionados:', this.insumosSeleccionados);

    // reset del select
    this.insumoSeleccionado = null;
  }

  calcularCantidad(insumo: InsumoAplicacion) {
    if (
      insumo.dosisPorHectarea > 0 &&
      this.formData.hectareasAplicadas > 0
    ) {
      insumo.cantidad =
        insumo.dosisPorHectarea * this.formData.hectareasAplicadas;
    } else {
      insumo.cantidad = 0;
    }
  }

  eliminarInsumo(index: number) {
    this.insumosSeleccionados = this.insumosSeleccionados.filter(
      (_, i) => i !== index
    );
  }

  // ================= GUARDAR =================

  guardar() {
    if (!this.validarFormulario()) return;

    this.formData.insumos = this.insumosSeleccionados.map((i) => ({
      insumoId: i.insumoId,
      cantidad: i.cantidad,
      dosisPorHectarea: i.dosisPorHectarea,
    }));

    this.loading = true;

    this.parcelasService.registrarAplicacion(this.formData).subscribe({
      next: () => {
        alert('Aplicación registrada correctamente');
        this.onSave.emit();
        this.cerrar();
      },
      error: (error) => {
        console.error('Error al registrar aplicación:', error);
        alert(error.error?.message || 'Error al registrar la aplicación');
        this.loading = false;
      },
    });
  }

  validarFormulario(): boolean {
    if (!this.formData.periodoSiembraId) {
      alert('Selecciona un período de siembra');
      return false;
    }

    if (this.formData.hectareasAplicadas <= 0) {
      alert('Las hectáreas aplicadas deben ser mayor a 0');
      return false;
    }

    if (this.insumosSeleccionados.length === 0) {
      alert('Agrega al menos un insumo');
      return false;
    }

    for (const insumo of this.insumosSeleccionados) {
      if (insumo.cantidad <= 0) {
        alert(`La cantidad de ${insumo.nombre} debe ser mayor a 0`);
        return false;
      }

      if (insumo.cantidad > (insumo.stockDisponible || 0)) {
        alert(
          `No hay suficiente stock de ${insumo.nombre} (disponible: ${insumo.stockDisponible})`
        );
        return false;
      }
    }

    return true;
  }

  cerrar() {
    this.onClose.emit();
  }
}

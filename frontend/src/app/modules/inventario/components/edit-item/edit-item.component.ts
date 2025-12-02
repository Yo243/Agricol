import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidatorFn,
} from '@angular/forms';
import { InventarioService } from '../../services/inventario.service';
import {
  InventarioItem,
  CategoriaInventario,
  UnidadMedida,
  EstadoInventario
} from '../../../../models/inventario.model';

@Component({
  selector: 'app-edit-item',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-item.component.html',
  styleUrls: ['./edit-item.component.css']
})
export class EditItemComponent implements OnInit {
  @Input() item: InventarioItem | null = null;
  @Output() closed = new EventEmitter<void>();

  itemForm: FormGroup;
  loading = false;
  error = '';
  success = false;

  categorias = Object.values(CategoriaInventario);
  unidades = Object.values(UnidadMedida);
  estados = Object.values(EstadoInventario);

  constructor(
    private fb: FormBuilder,
    private inventarioService: InventarioService
  ) {
    this.itemForm = this.fb.group(
      {
        // -------- Información general --------
        codigo: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(30),
            Validators.pattern(/^[A-Za-z0-9\-]+$/) // Solo letras, números y guiones
          ]
        ],
        nombre: [
          '',
          [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(120)
          ]
        ],
        categoria: ['', Validators.required],
        subcategoria: ['', [Validators.maxLength(60)]],
        descripcion: ['', [Validators.maxLength(500)]],

        // -------- Stock --------
        stockActual: [0, [Validators.required, Validators.min(0)]],
        stockMinimo: [0, [Validators.min(0)]],
        stockMaximo: [0, [Validators.min(0)]],

        unidadMedida: ['', Validators.required],

        // Ubicación
        ubicacion: ['', [Validators.maxLength(120)]],
        almacen: ['', [Validators.maxLength(80)]],
        seccion: ['', [Validators.maxLength(80)]],

        // -------- Costos / precios --------
        costoUnitario: [0, [Validators.required, Validators.min(0)]],
        precioVenta: [0, [Validators.min(0)]],

        // -------- Proveedor / lote --------
        proveedor: ['', [Validators.maxLength(100)]],
        numeroLote: ['', [Validators.maxLength(100)]],
        fechaAdquisicion: ['', [this.fechaNoFuturaValidator]],
        fechaVencimiento: [''],

        // Estado por defecto
        estado: [EstadoInventario.DISPONIBLE, Validators.required],
        activo: [true],

        // -------- Extras --------
        composicion: ['', [Validators.maxLength(150)]],
        concentracion: ['', [Validators.maxLength(100)]],
        marca: ['', [Validators.maxLength(100)]],
        presentacion: ['', [Validators.maxLength(100)]],
        observaciones: ['', [Validators.maxLength(500)]]
      },
      {
        validators: [
          this.validarStockRango(),
          this.validarPrecios(),
          this.validarFechas()
        ]
      }
    );
  }

  ngOnInit(): void {
    if (this.item) {
      this.itemForm.patchValue({
        ...this.item,
        fechaAdquisicion: this.item.fechaAdquisicion
          ? new Date(this.item.fechaAdquisicion).toISOString().split('T')[0]
          : '',
        fechaVencimiento: this.item.fechaVencimiento
          ? new Date(this.item.fechaVencimiento).toISOString().split('T')[0]
          : ''
      });
    }

    // Reaccionar cuando cambie la categoría
    this.itemForm.get('categoria')?.valueChanges.subscribe(() => {
      if (this.esActivo) {
        this.itemForm.patchValue(
          {
            unidadMedida: 'unidades',
            stockMinimo: this.itemForm.get('stockMinimo')?.value ?? 0,
            stockMaximo: this.itemForm.get('stockMaximo')?.value ?? 0
          },
          { emitEvent: false }
        );
      }

      if (this.esEnvase) {
        this.itemForm.patchValue(
          {
            fechaVencimiento: '',
            numeroLote: ''
          },
          { emitEvent: false }
        );
      }
    });
  }

  // =========================
  // Validadores custom
  // =========================

  /** Fecha de adquisición no puede ser futura */
  fechaNoFuturaValidator = (control: AbstractControl) => {
    const value = control.value;
    if (!value) return null;

    const controlDate = new Date(value);
    const today = new Date();
    controlDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (controlDate > today) {
      return { fechaFutura: true };
    }
    return null;
  };

  /** stockMaximo no puede ser menor que stockMinimo */
  validarStockRango(): ValidatorFn {
    return (group: AbstractControl) => {
      const minCtrl = group.get('stockMinimo');
      const maxCtrl = group.get('stockMaximo');
      if (!minCtrl || !maxCtrl) return null;

      const min = Number(minCtrl.value ?? 0);
      const max = Number(maxCtrl.value ?? 0);

      const errors = { ...(maxCtrl.errors || {}) };

      if (min > 0 && max > 0 && max < min) {
        errors['stockRango'] = true;
        maxCtrl.setErrors(errors);
      } else {
        if (errors['stockRango']) {
          delete errors['stockRango'];
          maxCtrl.setErrors(Object.keys(errors).length ? errors : null);
        }
      }
      return null;
    };
  }

  /** precioVenta no puede ser menor que costoUnitario (si ambos > 0) */
  validarPrecios(): ValidatorFn {
    return (group: AbstractControl) => {
      const costoCtrl = group.get('costoUnitario');
      const precioCtrl = group.get('precioVenta');
      if (!costoCtrl || !precioCtrl) return null;

      const costo = Number(costoCtrl.value ?? 0);
      const precio = Number(precioCtrl.value ?? 0);

      const errors = { ...(precioCtrl.errors || {}) };

      if (costo > 0 && precio > 0 && precio < costo) {
        errors['precioMenorCosto'] = true;
        precioCtrl.setErrors(errors);
      } else {
        if (errors['precioMenorCosto']) {
          delete errors['precioMenorCosto'];
          precioCtrl.setErrors(Object.keys(errors).length ? errors : null);
        }
      }

      return null;
    };
  }

  /** Fechas: vencimiento ≥ adquisición y no vencido para insumos */
  validarFechas(): ValidatorFn {
    return (group: AbstractControl) => {
      const cat = group.get('categoria')?.value as string;
      const esInsumo = [
        'Fertilizantes',
        'Pesticidas',
        'Herbicidas',
        'Fungicidas',
        'Semillas',
        'Combustibles y Lubricantes',
        'Insumos Generales',
        'Material de Riego',
        'Repuestos'
      ].includes(cat);

      const adqCtrl = group.get('fechaAdquisicion');
      const vencCtrl = group.get('fechaVencimiento');
      if (!adqCtrl || !vencCtrl) return null;

      const adqVal = adqCtrl.value;
      const vencVal = vencCtrl.value;

      const errors = { ...(vencCtrl.errors || {}) };

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (adqVal && vencVal) {
        const adq = new Date(adqVal);
        const venc = new Date(vencVal);
        adq.setHours(0, 0, 0, 0);
        venc.setHours(0, 0, 0, 0);

        if (venc < adq) {
          errors['vencimientoMenorAdquisicion'] = true;
        } else {
          delete errors['vencimientoMenorAdquisicion'];
        }
      }

      if (esInsumo && vencVal) {
        const venc = new Date(vencVal);
        venc.setHours(0, 0, 0, 0);
        if (venc < today) {
          errors['vencimientoPasado'] = true;
        } else {
          delete errors['vencimientoPasado'];
        }
      }

      if (Object.keys(errors).length) {
        vencCtrl.setErrors(errors);
      } else {
        vencCtrl.setErrors(null);
      }

      return null;
    };
  }

  // =========================
  // Helpers por categoría
  // =========================

  get categoriaSeleccionada(): string {
    return this.itemForm.get('categoria')?.value || '';
  }

  get esInsumo(): boolean {
    const cat = this.categoriaSeleccionada;
    return [
      'Fertilizantes',
      'Pesticidas',
      'Herbicidas',
      'Fungicidas',
      'Semillas',
      'Combustibles y Lubricantes',
      'Insumos Generales',
      'Material de Riego',
      'Repuestos'
    ].includes(cat);
  }

  get esActivo(): boolean {
    const cat = this.categoriaSeleccionada;
    return [
      'Herramientas',
      'Maquinaria',
      'Equipos de Protección'
    ].includes(cat);
  }

  get esEnvase(): boolean {
    const cat = this.categoriaSeleccionada;
    return cat === 'Envases y Embalajes';
  }

  // =========================
  // Submit
  // =========================

  onSubmit(): void {
    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';

    const formValue = this.itemForm.value;

    const payload = {
      ...formValue,
      ubicacion:
        formValue.ubicacion ||
        [formValue.almacen, formValue.seccion].filter(Boolean).join(' - ')
    };

    const observable = this.item
      ? this.inventarioService.updateItem(this.item.id, payload)
      : this.inventarioService.createItem(payload);

    observable.subscribe({
      next: () => {
        this.success = true;
        this.loading = false;
        setTimeout(() => this.close(), 1500);
      },
      error: (error) => {
        this.error = error?.message || 'Error al guardar el item';
        this.loading = false;
      }
    });
  }

  close(): void {
    this.closed.emit();
  }

  get valorTotal(): number {
    const stock = this.itemForm.get('stockActual')?.value || 0;
    const costo = this.itemForm.get('costoUnitario')?.value || 0;
    return stock * costo;
  }

  // =========================
  // Helpers para el template
  // =========================

  get today(): string {
    return new Date().toISOString().split('T')[0];
  }

  get codigoCtrl() { return this.itemForm.get('codigo'); }
  get nombreCtrl() { return this.itemForm.get('nombre'); }
  get categoriaCtrl() { return this.itemForm.get('categoria'); }
  get stockActualCtrl() { return this.itemForm.get('stockActual'); }
  get stockMinimoCtrl() { return this.itemForm.get('stockMinimo'); }
  get stockMaximoCtrl() { return this.itemForm.get('stockMaximo'); }
  get unidadMedidaCtrl() { return this.itemForm.get('unidadMedida'); }
  get costoUnitarioCtrl() { return this.itemForm.get('costoUnitario'); }
  get precioVentaCtrl() { return this.itemForm.get('precioVenta'); }
  get fechaAdquisicionCtrl() { return this.itemForm.get('fechaAdquisicion'); }
  get fechaVencimientoCtrl() { return this.itemForm.get('fechaVencimiento'); }
  get observacionesCtrl() { return this.itemForm.get('observaciones'); }
}

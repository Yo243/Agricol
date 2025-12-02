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
import { InventarioItem, TipoMovimiento } from '../../../../models/inventario.model';

@Component({
  selector: 'app-new-movement',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './new-movement.component.html',
  styleUrls: ['./new-movement.component.css']
})
export class NewMovementComponent implements OnInit {
  @Input() item: InventarioItem | null = null;
  @Output() closed = new EventEmitter<void>();

  // para abrir modal de nuevo producto desde el padre
  @Output() newItemRequested = new EventEmitter<void>();

  movimientoForm: FormGroup;
  loading = false;
  error = '';
  success = false;

  items: InventarioItem[] = [];
  tiposMovimiento = Object.values(TipoMovimiento);

  constructor(
    private fb: FormBuilder,
    private inventarioService: InventarioService
  ) {
    const hoy = this.today;

    this.movimientoForm = this.fb.group(
      {
        itemId: ['', Validators.required],

        tipo: [TipoMovimiento.ENTRADA, Validators.required],

        cantidad: [
          null,
          [
            Validators.required,
            Validators.min(0.01),
          ],
        ],

        costoUnitario: [
          0,
          [
            Validators.min(0),
          ],
        ],

        fecha: [
          hoy,
          [
            Validators.required,
            this.fechaNoPasadaValidator,
          ],
        ],

        razon: [
          '',
          [
            Validators.required,
            Validators.minLength(5),
            Validators.maxLength(200),
          ],
        ],

        referencia: ['', [Validators.maxLength(100)]],
        destino: ['', [Validators.maxLength(100)]],
        observaciones: ['', [Validators.maxLength(500)]],
      },
      {
        validators: [this.validarCostoSegunTipo()],
      }
    );
  }

  ngOnInit(): void {
    if (this.item) {
      this.movimientoForm.patchValue({
        itemId: this.item.id,
        costoUnitario: this.item.costoUnitario ?? 0,
      });
    } else {
      this.cargarItems();
    }

    this.movimientoForm.get('cantidad')?.valueChanges
      .subscribe(() => this.actualizarCostoTotal());
    this.movimientoForm.get('costoUnitario')?.valueChanges
      .subscribe(() => this.actualizarCostoTotal());
  }

  /** ✅ No permite fechas pasadas */
  fechaNoPasadaValidator = (control: AbstractControl) => {
    const value = control.value;
    if (!value) return null;

    const controlDate = new Date(value);
    const today = new Date();

    controlDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (controlDate < today) {
      return { fechaPasada: true };
    }

    return null;
  };

  /** ✅ Si es ENTRADA, el costo es obligatorio y > 0 */
  validarCostoSegunTipo(): ValidatorFn {
    return (group: AbstractControl) => {
      const tipo = group.get('tipo')?.value as TipoMovimiento;
      const costoUnitario = Number(group.get('costoUnitario')?.value || 0);

      const costoCtrl = group.get('costoUnitario');
      if (!costoCtrl) return null;

      if (tipo === TipoMovimiento.ENTRADA) {
        if (!costoUnitario || costoUnitario <= 0) {
          costoCtrl.setErrors({
            ...(costoCtrl.errors || {}),
            costoRequerido: true,
          });
        } else {
          const errors = costoCtrl.errors;
          if (errors && errors['costoRequerido']) {
            delete errors['costoRequerido'];
            costoCtrl.setErrors(Object.keys(errors).length ? errors : null);
          }
        }
      } else {
        // si cambiaron a SALIDA u otro tipo, quitamos ese error
        const errors = costoCtrl.errors;
        if (errors && errors['costoRequerido']) {
          delete errors['costoRequerido'];
          costoCtrl.setErrors(Object.keys(errors).length ? errors : null);
        }
      }

      return null;
    };
  }

  cargarItems(): void {
    this.inventarioService.getItems().subscribe({
      next: (items) => {
        this.items = items.filter(i => i.activo);
      },
      error: (error) => console.error('Error al cargar items:', error)
    });
  }

  onItemChange(): void {
    const itemId = Number(this.movimientoForm.get('itemId')?.value);
    if (!itemId) return;

    const selected = this.items.find(i => i.id === itemId);
    if (!selected) return;

    if (selected.costoUnitario != null && selected.costoUnitario > 0) {
      this.movimientoForm.patchValue({
        costoUnitario: selected.costoUnitario
      });
    } else {
      this.movimientoForm.patchValue({
        costoUnitario: 0
      });
    }
  }

  actualizarCostoTotal(): void {
    const cantidad = this.movimientoForm.get('cantidad')?.value || 0;
    const costoUnitario = this.movimientoForm.get('costoUnitario')?.value || 0;
    // solo recalculamos el getter
  }

  onSubmit(): void {
    if (this.movimientoForm.invalid) {
      this.movimientoForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';

    this.inventarioService.registrarMovimiento(this.movimientoForm.value).subscribe({
      next: () => {
        this.success = true;
        this.loading = false;
        setTimeout(() => this.close(), 1500);
      },
      error: (error) => {
        this.error = error.message || 'Error al registrar el movimiento';
        this.loading = false;
      }
    });
  }

  close(): void {
    this.closed.emit();
  }

  onNewItem(): void {
    this.newItemRequested.emit();
  }

  get costoTotal(): number {
    const cantidad = this.movimientoForm.get('cantidad')?.value || 0;
    const costoUnitario = this.movimientoForm.get('costoUnitario')?.value || 0;
    return cantidad * costoUnitario;
  }

  /** para usar en [min] del input date */
  get today(): string {
    return new Date().toISOString().split('T')[0];
  }

  // Getters para no ensuciar el HTML
  get itemIdCtrl() { return this.movimientoForm.get('itemId'); }
  get fechaCtrl() { return this.movimientoForm.get('fecha'); }
  get cantidadCtrl() { return this.movimientoForm.get('cantidad'); }
  get costoUnitarioCtrl() { return this.movimientoForm.get('costoUnitario'); }
  get razonCtrl() { return this.movimientoForm.get('razon'); }
  get referenciaCtrl() { return this.movimientoForm.get('referencia'); }
  get destinoCtrl() { return this.movimientoForm.get('destino'); }
  get observacionesCtrl() { return this.movimientoForm.get('observaciones'); }
}

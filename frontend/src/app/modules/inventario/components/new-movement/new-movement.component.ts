import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
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

  // 👉 para que el padre pueda abrir el modal de nuevo producto
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
    this.movimientoForm = this.fb.group({
      itemId: ['', Validators.required],
      tipo: [TipoMovimiento.ENTRADA, Validators.required],
      cantidad: [0, [Validators.required, Validators.min(0.01)]],
      costoUnitario: [0],
      fecha: [new Date().toISOString().split('T')[0], Validators.required],
      razon: ['', Validators.required],
      referencia: [''],
      destino: [''],
      observaciones: ['']
    });
  }

  ngOnInit(): void {
    if (this.item) {
      // Cuando vienes desde un item específico
      this.movimientoForm.patchValue({
        itemId: this.item.id,
        costoUnitario: this.item.costoUnitario
      });
    } else {
      // Cuando es "nuevo movimiento" general, cargar todos
      this.cargarItems();
    }

    // Actualizar costo total cuando cambia cantidad o costo unitario
    this.movimientoForm.get('cantidad')?.valueChanges
      .subscribe(() => this.actualizarCostoTotal());
    this.movimientoForm.get('costoUnitario')?.valueChanges
      .subscribe(() => this.actualizarCostoTotal());
  }

  cargarItems(): void {
    this.inventarioService.getItems().subscribe({
      next: (items) => {
        this.items = items.filter(i => i.activo);
      },
      error: (error) => console.error('Error al cargar items:', error)
    });
  }

  /**
   * Al seleccionar un producto:
   * - Si tiene costoUnitario > 0 → rellenamos el campo.
   * - Si no tiene, dejamos 0 para que el usuario lo capture.
   */
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
    // Solo para exponerlo al template; el backend igual lo recalcula
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

  // 👉 botón "Nuevo producto"
  onNewItem(): void {
    this.newItemRequested.emit();
  }

  get costoTotal(): number {
    const cantidad = this.movimientoForm.get('cantidad')?.value || 0;
    const costoUnitario = this.movimientoForm.get('costoUnitario')?.value || 0;
    return cantidad * costoUnitario;
  }
}

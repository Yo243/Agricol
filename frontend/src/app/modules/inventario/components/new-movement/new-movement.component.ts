import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { InventarioService } from '../../services/inventario.service';
import { InventarioItem, TipoMovimiento, UnidadMedida } from '../../../../models/inventario.model';

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
      this.movimientoForm.patchValue({
        itemId: this.item.id,
        costoUnitario: this.item.costoUnitario
      });
    } else {
      this.cargarItems();
    }

    // Actualizar costo total cuando cambia cantidad o costo unitario
    this.movimientoForm.get('cantidad')?.valueChanges.subscribe(() => this.actualizarCostoTotal());
    this.movimientoForm.get('costoUnitario')?.valueChanges.subscribe(() => this.actualizarCostoTotal());
  }

  cargarItems(): void {
    this.inventarioService.getItems().subscribe({
      next: (items) => {
        this.items = items.filter(i => i.activo);
      },
      error: (error) => console.error('Error al cargar items:', error)
    });
  }

  actualizarCostoTotal(): void {
    const cantidad = this.movimientoForm.get('cantidad')?.value || 0;
    const costoUnitario = this.movimientoForm.get('costoUnitario')?.value || 0;
    // El costo total se calculará en el backend
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

  get costoTotal(): number {
    const cantidad = this.movimientoForm.get('cantidad')?.value || 0;
    const costoUnitario = this.movimientoForm.get('costoUnitario')?.value || 0;
    return cantidad * costoUnitario;
  }
}
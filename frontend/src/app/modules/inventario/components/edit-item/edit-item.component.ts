import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { InventarioService } from '../../services/inventario.service';
import { InventarioItem, CategoriaInventario, UnidadMedida, EstadoInventario } from '../../../../models/inventario.model';

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
    this.itemForm = this.fb.group({
      codigo: ['', Validators.required],
      nombre: ['', Validators.required],
      categoria: ['', Validators.required],
      subcategoria: [''],
      descripcion: [''],
      stockActual: [0, [Validators.required, Validators.min(0)]],
      stockMinimo: [0, [Validators.required, Validators.min(0)]],
      stockMaximo: [0, [Validators.required, Validators.min(0)]],
      unidadMedida: ['', Validators.required],
      ubicacion: ['', Validators.required],
      almacen: [''],
      seccion: [''],
      costoUnitario: [0, [Validators.required, Validators.min(0)]],
      precioVenta: [0],
      proveedor: [''],
      numeroLote: [''],
      fechaAdquisicion: [''],
      fechaVencimiento: [''],
      estado: ['', Validators.required],
      activo: [true],
      composicion: [''],
      concentracion: [''],
      marca: [''],
      presentacion: [''],
      observaciones: ['']
    });
  }

  ngOnInit(): void {
    if (this.item) {
      this.itemForm.patchValue({
        ...this.item,
        fechaAdquisicion: this.item.fechaAdquisicion ? new Date(this.item.fechaAdquisicion).toISOString().split('T')[0] : '',
        fechaVencimiento: this.item.fechaVencimiento ? new Date(this.item.fechaVencimiento).toISOString().split('T')[0] : ''
      });
    }
  }

  onSubmit(): void {
    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';

    const observable = this.item
      ? this.inventarioService.updateItem(this.item.id, this.itemForm.value)
      : this.inventarioService.createItem(this.itemForm.value);

    observable.subscribe({
      next: () => {
        this.success = true;
        setTimeout(() => this.close(), 1500);
      },
      error: (error) => {
        this.error = error.message || 'Error al guardar el item';
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
}
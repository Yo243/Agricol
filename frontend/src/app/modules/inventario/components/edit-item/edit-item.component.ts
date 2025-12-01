import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
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
    this.itemForm = this.fb.group({
      // -------- Información general --------
      codigo: ['', Validators.required],
      nombre: ['', Validators.required],
      categoria: ['', Validators.required],
      subcategoria: [''],
      descripcion: [''],

      // -------- Stock --------
      stockActual: [0, [Validators.required, Validators.min(0)]],
      stockMinimo: [0, [Validators.min(0)]],
      stockMaximo: [0, [Validators.min(0)]],

      unidadMedida: ['', Validators.required],

      // Ubicación (no required, se arma con almacen + seccion si hace falta)
      ubicacion: [''],
      almacen: [''],
      seccion: [''],

      // -------- Costos / precios --------
      costoUnitario: [0, [Validators.required, Validators.min(0)]],
      precioVenta: [0],

      // -------- Proveedor / lote --------
      proveedor: [''],
      numeroLote: [''],
      fechaAdquisicion: [''],
      fechaVencimiento: [''],

      // Estado por defecto
      estado: [EstadoInventario.DISPONIBLE],
      activo: [true],

      // -------- Extras --------
      composicion: [''],
      concentracion: [''],
      marca: [''],
      presentacion: [''],
      observaciones: ['']
    });
  }

  ngOnInit(): void {
    // Si viene un item, lo cargamos
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
      // Si es activo, por defecto manejamos "unidades"
      if (this.esActivo) {
        this.itemForm.patchValue(
          {
            unidadMedida: 'unidades',
            // para equipo normalmente no te importa tanto min/max
            stockMinimo: this.itemForm.get('stockMinimo')?.value ?? 0,
            stockMaximo: this.itemForm.get('stockMaximo')?.value ?? 0
          },
          { emitEvent: false }
        );
      }

      // Si es envase simple, puedes resetear campos de vencimiento/lote si quieres
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
  // Helpers por categoría
  // =========================

  get categoriaSeleccionada(): string {
    return this.itemForm.get('categoria')?.value || '';
  }

  // Insumos: fertilizantes, pesticidas, semillas, etc.
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

  // Maquinaria / herramientas / equipos de protección
  get esActivo(): boolean {
    const cat = this.categoriaSeleccionada;
    return [
      'Herramientas',
      'Maquinaria',
      'Equipos de Protección'
    ].includes(cat);
  }

  // Envases y embalajes simples
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

    // Si no se capturó "ubicacion", la armamos a partir de almacen + seccion
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
}

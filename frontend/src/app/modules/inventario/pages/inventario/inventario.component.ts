import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventarioService } from '../../services/inventario.service';
import { NewMovementComponent } from '../../components/new-movement/new-movement.component';
import { EditItemComponent } from '../../components/edit-item/edit-item.component';
import { AlertsComponent } from '../../components/alerts/alerts.component';
import { 
  InventarioItem, 
  CategoriaInventario, 
  EstadoInventario,
  AlertaInventario 
} from '../../../../models/inventario.model';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [
    CommonModule, 
    CurrencyPipe, 
    DatePipe,
    FormsModule,
    NewMovementComponent,
    EditItemComponent,
    AlertsComponent
  ],
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.css']
})
export class InventarioComponent implements OnInit {

  items: InventarioItem[] = [];
  itemsFiltrados: InventarioItem[] = [];
  alertas: AlertaInventario[] = [];

  // Modales
  showNewMovementModal = false;
  showEditItemModal = false;
  showAlertsModal = false;
  selectedItem: InventarioItem | null = null;

  // Filtros
  searchTerm = '';
  categoriaFiltro: string = 'TODAS';
  estadoFiltro: string = 'TODOS';

  // Vista
  vistaActual: 'tabla' | 'tarjetas' = 'tabla';

  // Estadísticas
  estadisticas = {
    totalItems: 0,
    valorTotal: 0,
    itemsBajoStock: 0,
    itemsPorVencer: 0,
    itemsVencidos: 0,
    categorias: new Map<string, number>()
  };

  // Enums exportados al template
  categorias = Object.values(CategoriaInventario);
  estados = Object.values(EstadoInventario);

  constructor(private inventarioService: InventarioService) {}

  ngOnInit(): void {
    this.cargarInventario();
    this.cargarAlertas();
  }

  // ===============================
  // CARGA DE DATOS
  // ===============================

  cargarInventario(): void {
    this.inventarioService.getItems().subscribe({
      next: (items) => {
        this.items = items;
        this.itemsFiltrados = items;
        this.calcularEstadisticas();
      },
      error: (error) => console.error('Error al cargar inventario:', error)
    });
  }

  cargarAlertas(): void {
    this.inventarioService.getAlertas().subscribe({
      next: (alertas) => {
        this.alertas = alertas.filter(a => !a.leida);
      },
      error: (error) => console.error('Error al cargar alertas:', error)
    });
  }

  // ===============================
  // ESTADÍSTICAS
  // ===============================

  calcularEstadisticas(): void {
    this.estadisticas.totalItems = this.items.length;

    this.estadisticas.valorTotal = this.items.reduce((sum, item) => sum + item.valorTotal, 0);

    this.estadisticas.itemsBajoStock = this.items.filter(i =>
      i.estado === EstadoInventario.BAJO || i.estado === EstadoInventario.CRITICO
    ).length;

    this.estadisticas.itemsPorVencer = this.items.filter(i =>
      i.estado === EstadoInventario.POR_VENCER
    ).length;

    this.estadisticas.itemsVencidos = this.items.filter(i =>
      i.estado === EstadoInventario.VENCIDO
    ).length;

    this.estadisticas.categorias.clear();
    this.items.forEach(item => {
      const count = this.estadisticas.categorias.get(item.categoria) || 0;
      this.estadisticas.categorias.set(item.categoria, count + 1);
    });
  }

  // ===============================
  // FILTROS
  // ===============================

  filtrarItems(): void {
    this.itemsFiltrados = this.items.filter(item => {
      const matchSearch =
        !this.searchTerm ||
        item.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.codigo.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchCategoria =
        this.categoriaFiltro === 'TODAS' || item.categoria === this.categoriaFiltro;

      const matchEstado =
        this.estadoFiltro === 'TODOS' || item.estado === this.estadoFiltro;

      return matchSearch && matchCategoria && matchEstado;
    });
  }

  onSearchChange(): void { this.filtrarItems(); }
  onCategoriaChange(): void { this.filtrarItems(); }
  onEstadoChange(): void { this.filtrarItems(); }

  // ===============================
  // MODALES
  // ===============================

  openNewMovementModal(item?: InventarioItem): void {
    this.selectedItem = item || null;
    this.showNewMovementModal = true;
  }

  closeNewMovementModal(): void {
    this.showNewMovementModal = false;
    this.selectedItem = null;
    this.cargarInventario();
  }

  openEditItemModal(item: InventarioItem): void {
    this.selectedItem = item;
    this.showEditItemModal = true;
  }

  closeEditItemModal(): void {
    this.showEditItemModal = false;
    this.selectedItem = null;
    this.cargarInventario();
  }

  openAlertsModal(): void {
    this.showAlertsModal = true;
  }

  closeAlertsModal(): void {
    this.showAlertsModal = false;
    this.cargarAlertas();
  }

  // ===============================
  // ICONOS (Tabler Icons)
  // ===============================

  getIconoCategoria(categoria: CategoriaInventario): string {
    const iconos: Record<string, string> = {
      [CategoriaInventario.FERTILIZANTES]: 'ti-plant-2',
      [CategoriaInventario.PESTICIDAS]: 'ti-spray',
      [CategoriaInventario.HERBICIDAS]: 'ti-leaf',
      [CategoriaInventario.FUNGICIDAS]: 'ti-mushroom',
      [CategoriaInventario.SEMILLAS]: 'ti-grain',
      [CategoriaInventario.HERRAMIENTAS]: 'ti-tool',
      [CategoriaInventario.MAQUINARIA]: 'ti-tractor',
      [CategoriaInventario.EQUIPOS]: 'ti-helmet',
      [CategoriaInventario.COMBUSTIBLES]: 'ti-gas-station',
      [CategoriaInventario.INSUMOS]: 'ti-package',
      [CategoriaInventario.REPUESTOS]: 'ti-settings',
      [CategoriaInventario.MATERIAL_RIEGO]: 'ti-droplet',
      [CategoriaInventario.ENVASES]: 'ti-box'
    };

    return iconos[categoria] ?? 'ti-package';
  }

  // ===============================
  // BADGES DE ESTADO
  // ===============================

  getBadgeClass(estado: EstadoInventario): string {
    const classes: Record<string, string> = {
      [EstadoInventario.DISPONIBLE]: 'bg-green-100 text-green-700 border border-green-200',
      [EstadoInventario.BAJO]: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
      [EstadoInventario.CRITICO]: 'bg-orange-100 text-orange-700 border border-orange-200',
      [EstadoInventario.POR_VENCER]: 'bg-blue-100 text-blue-700 border border-blue-200',
      [EstadoInventario.VENCIDO]: 'bg-red-100 text-red-700 border border-red-200',
      [EstadoInventario.AGOTADO]: 'bg-gray-200 text-gray-700 border border-gray-300'
    };

    return classes[estado] || 'bg-gray-100 text-gray-700 border border-gray-300';
  }

  // ===============================
  // EXPORTAR
  // ===============================

  cambiarVista(vista: 'tabla' | 'tarjetas'): void {
    this.vistaActual = vista;
  }
}

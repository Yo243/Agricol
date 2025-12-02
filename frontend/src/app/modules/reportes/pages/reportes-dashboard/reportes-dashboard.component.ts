import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule, ChartComponent } from 'ng-apexcharts';
import { ReportesService } from '../../services/reportes.service';
import { 
  DashboardResponse,
  ConsumoCultivoItem,
  CostoMesItem,
  AlertaItem,
  PeriodoActivoItem
} from '../../../../models/reportes.model';

import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexStroke,
  ApexYAxis,
  ApexTitleSubtitle,
  ApexLegend,
  ApexPlotOptions,
  ApexFill,
  ApexTooltip,
  ApexResponsive
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis?: ApexYAxis;
  dataLabels: ApexDataLabels;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
  legend: ApexLegend;
  plotOptions?: ApexPlotOptions;
  fill?: ApexFill;
  tooltip?: ApexTooltip;
  colors?: string[];
  responsive?: ApexResponsive[];
};

@Component({
  selector: 'app-reportes-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NgApexchartsModule],
  templateUrl: './reportes-dashboard.component.html',
  styleUrls: ['./reportes-dashboard.component.css']
})
export class ReportesDashboardComponent implements OnInit {
  @ViewChild('chartConsumo') chartConsumo!: ChartComponent;
  @ViewChild('chartCostos') chartCostos!: ChartComponent;

  // Services
  private reportesService = inject(ReportesService);
  private router = inject(Router);

  // Data
  dashboardData: DashboardResponse | null = null;
  loading: boolean = true;
  errorMessage: string = '';

  // Filtros
  fechaInicio: string = '';
  fechaFin: string = '';

  // Opciones de gráficas
  chartConsumoOptions: Partial<ChartOptions> = {};
  chartCostosOptions: Partial<ChartOptions> = {};

  constructor() {
    this.initDateFilters();
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  /**
   * Inicializa los filtros de fecha por defecto (últimos 3 meses)
   */
  initDateFilters(): void {
    const hoy = new Date();
    const tresMesesAtras = new Date();
    tresMesesAtras.setMonth(hoy.getMonth() - 3);

    this.fechaInicio = tresMesesAtras.toISOString().split('T')[0];
    this.fechaFin = hoy.toISOString().split('T')[0];
  }

  /**
   * Carga los datos del dashboard desde el servicio
   */
  loadDashboardData(): void {
    this.loading = true;
    this.errorMessage = '';
    
    this.reportesService.getDashboard(this.fechaInicio, this.fechaFin).subscribe({
      next: (data: DashboardResponse) => {
        this.dashboardData = data;
        this.initCharts();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar dashboard:', error);
        this.errorMessage = 'Error al cargar los datos del dashboard. Por favor, intente nuevamente.';
        this.loading = false;
      }
    });
  }

  /**
   * Inicializa las configuraciones de las gráficas ApexCharts
   */
  initCharts(): void {
    if (!this.dashboardData) return;

    this.initConsumoChart();
    this.initCostosChart();
  }

  /**
   * Configura la gráfica de consumo por cultivo (Barras)
   */
  private initConsumoChart(): void {
    if (!this.dashboardData || this.dashboardData.consumoPorCultivo.length === 0) {
      return;
    }

    const cultivos = this.dashboardData.consumoPorCultivo.map((c: ConsumoCultivoItem) => c.cultivo);
    const cantidades = this.dashboardData.consumoPorCultivo.map((c: ConsumoCultivoItem) => c.cantidad);

    this.chartConsumoOptions = {
      series: [{
        name: 'Cantidad Consumida',
        data: cantidades
      }],
      chart: {
        type: 'bar',
        height: 350,
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: false,
            zoom: false,
            zoomin: false,
            zoomout: false,
            pan: false,
            reset: false
          }
        },
        animations: {
          enabled: true,
          speed: 800,
          animateGradually: {
            enabled: true,
            delay: 150
          },
          dynamicAnimation: {
            enabled: true,
            speed: 350
          }
        }
      },
      plotOptions: {
        bar: {
          borderRadius: 8,
          dataLabels: {
            position: 'top'
          },
          columnWidth: '60%'
        }
      },
      dataLabels: {
        enabled: true,
        formatter: function (val: any) {
          return val.toFixed(1);
        },
        offsetY: -20,
        style: {
          fontSize: '11px',
          fontWeight: '600',
          colors: ['#374151']
        }
      },
      xaxis: {
        categories: cultivos,
        position: 'bottom',
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        },
        labels: {
          style: {
            fontSize: '12px',
            fontWeight: '500'
          }
        }
      },
      yaxis: {
        title: {
          text: 'Cantidad Total',
          style: {
            fontSize: '12px',
            fontWeight: '600',
            color: '#6b7280'
          }
        },
        labels: {
          formatter: function (val: any) {
            return val.toFixed(0);
          },
          style: {
            fontSize: '11px'
          }
        }
      },
      title: {
        text: '',
        align: 'left',
        style: {
          fontSize: '14px',
          fontWeight: '600',
          color: '#111827'
        }
      },
      colors: ['#1a7f5a'],
      tooltip: {
        y: {
          formatter: function (val: any) {
            return val.toFixed(2);
          }
        },
        theme: 'light',
        style: {
          fontSize: '12px'
        }
      },
      legend: {
        show: false
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent']
      },
      fill: {
        opacity: 1
      },
      responsive: [{
        breakpoint: 768,
        options: {
          chart: {
            height: 300
          },
          plotOptions: {
            bar: {
              columnWidth: '80%'
            }
          }
        }
      }]
    };
  }

  /**
   * Configura la gráfica de evolución de costos (Línea/Área)
   */
  private initCostosChart(): void {
    if (!this.dashboardData || this.dashboardData.costosPorMes.length === 0) {
      return;
    }

    const meses = this.dashboardData.costosPorMes.map((c: CostoMesItem) => c.mes);
    const costos = this.dashboardData.costosPorMes.map((c: CostoMesItem) => c.costo);

    this.chartCostosOptions = {
      series: [{
        name: 'Costos Mensuales',
        data: costos
      }],
      chart: {
        type: 'area',
        height: 350,
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: false,
            zoom: false,
            zoomin: false,
            zoomout: false,
            pan: false,
            reset: false
          }
        },
        animations: {
          enabled: true,
          speed: 800,
          animateGradually: {
            enabled: true,
            delay: 150
          },
          dynamicAnimation: {
            enabled: true,
            speed: 350
          }
        }
      },
      stroke: {
        curve: 'smooth',
        width: 3
      },
      dataLabels: {
        enabled: false,
        style: {
          fontSize: '12px',
          fontWeight: '600'
        }
      },
      xaxis: {
        categories: meses,
        title: {
          text: 'Período',
          style: {
            fontSize: '12px',
            fontWeight: '600',
            color: '#6b7280'
          }
        },
        labels: {
          style: {
            fontSize: '11px',
            fontWeight: '500'
          }
        }
      },
      yaxis: {
        title: {
          text: 'Costo ($)',
          style: {
            fontSize: '12px',
            fontWeight: '600',
            color: '#6b7280'
          }
        },
        labels: {
          formatter: function (val: any) {
            return '$' + val.toLocaleString('es-MX', { maximumFractionDigits: 0 });
          },
          style: {
            fontSize: '11px'
          }
        }
      },
      title: {
        text: '',
        align: 'left',
        style: {
          fontSize: '14px',
          fontWeight: '600',
          color: '#111827'
        }
      },
      colors: ['#10b981'],
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.5,
          opacityTo: 0.1,
          stops: [0, 90, 100]
        }
      },
      tooltip: {
        y: {
          formatter: function (val: any) {
            return '$' + val.toLocaleString('es-MX', { 
              minimumFractionDigits: 2,
              maximumFractionDigits: 2 
            });
          }
        },
        theme: 'light',
        style: {
          fontSize: '12px'
        }
      },
      legend: {
        show: false
      },
      plotOptions: {},
      responsive: [{
        breakpoint: 768,
        options: {
          chart: {
            height: 300
          }
        }
      }]
    };
  }

  /**
   * Aplica los filtros de fecha y recarga los datos
   */
  aplicarFiltros(): void {
    if (!this.fechaInicio || !this.fechaFin) {
      alert('Por favor seleccione ambas fechas');
      return;
    }

    const inicio = new Date(this.fechaInicio);
    const fin = new Date(this.fechaFin);

    if (inicio > fin) {
      alert('La fecha de inicio debe ser anterior a la fecha de fin');
      return;
    }

    this.loadDashboardData();
  }

  /**
   * Limpia los filtros y restaura los valores por defecto
   */
  limpiarFiltros(): void {
    this.initDateFilters();
    this.loadDashboardData();
  }

  /**
   * Exporta el dashboard a PDF
   * NOTA: Requiere instalar: npm install jspdf html2canvas
   */
  async exportarPDF(): Promise<void> {
    try {
      // Importación dinámica
      const jsPDFModule = await import('jspdf');
      const html2canvasModule = await import('html2canvas');
      
      const jsPDF = jsPDFModule.default;
      const html2canvas = html2canvasModule.default;

      const element = document.querySelector('.dashboard-container');
      if (!element) {
        alert('No se pudo encontrar el contenido para exportar');
        return;
      }

      // Mostrar mensaje de carga
      const originalCursor = document.body.style.cursor;
      document.body.style.cursor = 'wait';

      const canvas = await html2canvas(element as HTMLElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#fafafa'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Primera página
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Páginas adicionales si es necesario
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fecha = new Date().toISOString().split('T')[0];
      pdf.save(`dashboard-agricol-${fecha}.pdf`);

      // Restaurar cursor
      document.body.style.cursor = originalCursor;

    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF. Asegúrese de tener instalados jspdf y html2canvas: npm install jspdf html2canvas');
    }
  }

  /**
   * Exporta el dashboard a Excel
   * NOTA: Requiere instalar: npm install xlsx
   */
  async exportarExcel(): Promise<void> {
    try {
      // Importación dinámica
      const XLSX = await import('xlsx');

      if (!this.dashboardData) {
        alert('No hay datos para exportar');
        return;
      }

      // Crear workbook
      const wb = XLSX.utils.book_new();

      // Hoja 1: Resumen General
      const resumenData = [
        ['DASHBOARD AGRICOL - RESUMEN GENERAL'],
        [],
        ['Período', `${this.fechaInicio} hasta ${this.fechaFin}`],
        [],
        ['Métrica', 'Valor'],
        ['Total Parcelas', this.dashboardData.resumenGeneral.totalParcelas],
        ['Hectáreas Totales', this.dashboardData.resumenGeneral.hectareasTotales],
        ['Cultivos Activos', this.dashboardData.resumenGeneral.cultivosActivos],
        ['Costo Total Acumulado', this.dashboardData.resumenGeneral.costoTotalAcumulado]
      ];
      const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
      XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');

      // Hoja 2: Consumo por Cultivo
      if (this.dashboardData.consumoPorCultivo.length > 0) {
        const consumoHeaders = [['Cultivo', 'Cantidad', 'Unidad', 'Costo']];
        const consumoData = this.dashboardData.consumoPorCultivo.map((c: ConsumoCultivoItem) => [
          c.cultivo,
          c.cantidad,
          c.unidad,
          c.costo
        ]);
        const wsConsumo = XLSX.utils.aoa_to_sheet([...consumoHeaders, ...consumoData]);
        XLSX.utils.book_append_sheet(wb, wsConsumo, 'Consumo por Cultivo');
      }

      // Hoja 3: Costos por Mes
      if (this.dashboardData.costosPorMes.length > 0) {
        const costosHeaders = [['Mes', 'Costo', 'Aplicaciones']];
        const costosData = this.dashboardData.costosPorMes.map((c: CostoMesItem) => [
          c.mes,
          c.costo,
          c.aplicaciones
        ]);
        const wsCostos = XLSX.utils.aoa_to_sheet([...costosHeaders, ...costosData]);
        XLSX.utils.book_append_sheet(wb, wsCostos, 'Costos Mensuales');
      }

      // Hoja 4: Períodos Activos
      if (this.dashboardData.periodosActivos.length > 0) {
        const periodosHeaders = [['Código', 'Cultivo', 'Parcela', 'Hectáreas', 'Fecha Inicio', 'Cosecha Esperada', 'Estado', 'Progreso', 'Costo Total']];
        const periodosData = this.dashboardData.periodosActivos.map((p: PeriodoActivoItem) => [
          p.codigo,
          p.cultivo,
          p.parcela,
          p.hectareas,
          p.fechaInicio,
          p.fechaCosechaEsperada,
          p.estado,
          `${p.progreso}%`,
          p.costoTotal
        ]);
        const wsPeriodos = XLSX.utils.aoa_to_sheet([...periodosHeaders, ...periodosData]);
        XLSX.utils.book_append_sheet(wb, wsPeriodos, 'Períodos Activos');
      }

      // Hoja 5: Alertas
      if (this.dashboardData.alertas.length > 0) {
        const alertasHeaders = [['Tipo', 'Prioridad', 'Mensaje', 'Fecha']];
        const alertasData = this.dashboardData.alertas.map((a: AlertaItem) => [
          a.tipo,
          a.prioridad,
          a.mensaje,
          a.fecha
        ]);
        const wsAlertas = XLSX.utils.aoa_to_sheet([...alertasHeaders, ...alertasData]);
        XLSX.utils.book_append_sheet(wb, wsAlertas, 'Alertas');
      }

      // Generar archivo
      const fecha = new Date().toISOString().split('T')[0];
      XLSX.writeFile(wb, `dashboard-agricol-${fecha}.xlsx`);

    } catch (error) {
      console.error('Error al generar Excel:', error);
      alert('Error al generar el archivo Excel. Asegúrese de tener instalado xlsx: npm install xlsx');
    }
  }
  /**
   * Navega al detalle de un período
   */
  verDetallePeriodo(periodoId: number, parcelaId?: any): void {
    console.log("🔍 Ver detalle período clickeado desde dashboard. ID:", periodoId);
    console.log("📋 ParcelaId recibido:", parcelaId);
    
    // Navegar al detalle del período
    console.log("✅ Navegando a detalle del período:", periodoId);
    this.router.navigate(["/periodos-siembra", periodoId]);
  }


  /**
   * Recarga los datos del dashboard
   */
  recargarDatos(): void {
    this.loadDashboardData();
  }
}
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule, ChartComponent } from 'ng-apexcharts';
import { ReportesService } from '../../services/reportes.service';
import { NgIf, NgFor } from '@angular/common';

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

interface DashboardData {
  resumenGeneral: {
    totalParcelas: number;
    hectareasTotales: number;
    cultivosActivos: number;
    costoTotalAcumulado: number;
  };
  consumoPorCultivo: any[];
  costosPorMes: any[];
  alertas: any[];
  periodosActivos: any[];
}

@Component({
  selector: 'app-reportes-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NgApexchartsModule, NgIf, NgIf, ],
  templateUrl: './reportes-dashboard.component.html',
  styleUrls: ['./reportes-dashboard.component.css']
})
export class ReportesDashboardComponent implements OnInit {
  @ViewChild('chartConsumo') chartConsumo!: ChartComponent;
  @ViewChild('chartCostos') chartCostos!: ChartComponent;

  // Services
  private reportesService = inject(ReportesService);

  // Data
  dashboardData: DashboardData | null = null;
  loading: boolean = true;

  // Filtros
  fechaInicio: string = '';
  fechaFin: string = '';

  // Opciones de gráficas
  chartConsumoOptions: Partial<ChartOptions> = {};
  chartCostosOptions: Partial<ChartOptions> = {};
  chartRendimientoOptions: Partial<ChartOptions> = {};

  constructor() {
    this.initDateFilters();
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  initDateFilters(): void {
    const hoy = new Date();
    const tresMesesAtras = new Date();
    tresMesesAtras.setMonth(hoy.getMonth() - 3);

    this.fechaInicio = tresMesesAtras.toISOString().split('T')[0];
    this.fechaFin = hoy.toISOString().split('T')[0];
  }

  loadDashboardData(): void {
    this.loading = true;
    
    this.reportesService.getDashboard(this.fechaInicio, this.fechaFin).subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.initCharts();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar dashboard:', error);
        this.loading = false;
      }
    });
  }

  initCharts(): void {
    if (!this.dashboardData) return;

    // Gráfica de Consumo por Cultivo
    this.chartConsumoOptions = {
      series: [{
        name: 'Cantidad (kg/L)',
        data: this.dashboardData.consumoPorCultivo.map(c => c.cantidad)
      }],
      chart: {
        type: 'bar',
        height: 350,
        toolbar: {
          show: true
        },
        animations: {
          enabled: true,
          speed: 800
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
          return val.toFixed(0);
        },
        offsetY: -20,
        style: {
          fontSize: '12px',
          colors: ['#304758']
        }
      },
      xaxis: {
        categories: this.dashboardData.consumoPorCultivo.map(c => c.cultivo),
        position: 'bottom',
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        }
      },
      yaxis: {
        title: {
          text: 'Cantidad Total'
        }
      },
      title: {
        text: 'Consumo de Insumos por Cultivo',
        align: 'center',
        style: {
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#0f766e'
        }
      },
      colors: ['#0f766e'],
      tooltip: {
        y: {
          formatter: function (val: any) {
            return val.toFixed(2) + ' kg/L';
          }
        }
      }
    };

    // Gráfica de Costos por Mes
    this.chartCostosOptions = {
      series: [{
        name: 'Costos',
        data: this.dashboardData.costosPorMes.map(c => c.costo)
      }],
      chart: {
        type: 'line',
        height: 350,
        toolbar: {
          show: true
        },
        animations: {
          enabled: true,
          speed: 800
        }
      },
      stroke: {
        curve: 'smooth',
        width: 3
      },
      dataLabels: {
        enabled: false
      },
      xaxis: {
        categories: this.dashboardData.costosPorMes.map(c => c.mes),
        title: {
          text: 'Mes'
        }
      },
      yaxis: {
        title: {
          text: 'Costo ($)'
        },
        labels: {
          formatter: function (val: any) {
            return '$' + val.toLocaleString();
          }
        }
      },
      title: {
        text: 'Evolución de Costos Mensuales',
        align: 'center',
        style: {
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#0f766e'
        }
      },
      colors: ['#14b8a6'],
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.3,
          stops: [0, 90, 100]
        }
      },
      tooltip: {
        y: {
          formatter: function (val: any) {
            return '$' + val.toLocaleString('es-MX', { minimumFractionDigits: 2 });
          }
        }
      }
    };
  }

  aplicarFiltros(): void {
    this.loadDashboardData();
  }

  limpiarFiltros(): void {
    this.initDateFilters();
    this.loadDashboardData();
  }

  exportarPDF(): void {
    // TODO: Implementar exportación a PDF
    alert('Exportando a PDF...');
  }

  exportarExcel(): void {
    // TODO: Implementar exportación a Excel
    alert('Exportando a Excel...');
  }
}
import { Component, OnInit, inject } from '@angular/core';

import { Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PeriodosSiembraService } from '../../services/periodos-siembra.service';

@Component({
  selector: 'app-periodo-siembra-create',
  standalone: true,
  imports: [
    RouterModule,
    FormsModule,
    ReactiveFormsModule
],
  templateUrl: './periodo-siembra-create.component.html',
  styleUrls: ['./periodo-siembra-create.component.css']
})
export class PeriodoSiembraCreateComponent implements OnInit {

  // Services
  private fb = inject(FormBuilder);
  private periodosService = inject(PeriodosSiembraService);
  private router = inject(Router);

  // Form
  periodoForm!: FormGroup;
  loading: boolean = false;
  errorMessage: string = '';

  // Datos para selects
  parcelas: any[] = [];
  cultivos: any[] = [];

  constructor() {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadParcelas();
    this.loadCultivos();
  }

  initForm(): void {
    const hoy = new Date().toISOString().split('T')[0];

    this.periodoForm = this.fb.group({
      parcelaId: ['', Validators.required],
      cultivoId: ['', Validators.required],
      fechaInicio: [hoy, Validators.required],
      fechaCosechaEsperada: ['', Validators.required],
      hectareasSembradas: ['', [Validators.required, Validators.min(0.1)]],
      rendimientoEsperado: ['', Validators.min(0)],
      observaciones: ['']
    });
  }

  loadParcelas(): void {
    this.periodosService.getParcelas().subscribe({
      next: (data) => {
        this.parcelas = data;
      },
      error: (error) => {
        console.error('Error al cargar parcelas:', error);
      }
    });
  }

  loadCultivos(): void {
    this.periodosService.getCultivos().subscribe({
      next: (data) => {
        this.cultivos = data;
      },
      error: (error) => {
        console.error('Error al cargar cultivos:', error);
      }
    });
  }

  onParcelaChange(): void {
    const parcelaId = this.periodoForm.get('parcelaId')?.value;
    if (parcelaId) {
      const parcela = this.parcelas.find(p => p.id === parseInt(parcelaId));
      if (parcela) {
        this.periodoForm.patchValue({
          hectareasSembradas: parcela.superficieHa
        });
      }
    }
  }

  onCultivoChange(): void {
    const cultivoId = this.periodoForm.get('cultivoId')?.value;
    if (cultivoId) {
      const cultivo = this.cultivos.find(c => c.id === parseInt(cultivoId));
      if (cultivo && cultivo.diasCiclo) {
        const fechaInicio = new Date(this.periodoForm.get('fechaInicio')?.value);
        const fechaCosecha = new Date(fechaInicio);
        fechaCosecha.setDate(fechaCosecha.getDate() + cultivo.diasCiclo);

        this.periodoForm.patchValue({
          fechaCosechaEsperada: fechaCosecha.toISOString().split('T')[0]
        });
      }
    }
  }

  onSubmit(): void {
    if (this.periodoForm.invalid) {
      Object.keys(this.periodoForm.controls).forEach(key => {
        this.periodoForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.periodosService.create(this.periodoForm.value).subscribe({
      next: () => {
        this.router.navigate(['/reportes']);
      },
      error: (error) => {
        console.error('Error al crear período:', error);
        this.errorMessage = error.error?.message || 'Error al crear período de siembra';
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/reportes']);
  }

  calcularDiferenciaDias(fechaInicio: string, fechaFin: string): number {
    if (!fechaInicio || !fechaFin) return 0;
    
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diferencia = fin.getTime() - inicio.getTime();
    return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
  }

  // ========================================
  // 🔥 LAS FUNCIONES QUE TE HACÍAN FALTA
  // ========================================

  getNombreParcela(): string {
    const id = this.periodoForm.get('parcelaId')?.value;
    const parcela = this.parcelas.find(p => p.id === Number(id));
    return parcela ? parcela.nombre : '-';
  }

  getNombreCultivo(): string {
    const id = this.periodoForm.get('cultivoId')?.value;
    const cultivo = this.cultivos.find(c => c.id === Number(id));
    return cultivo ? cultivo.nombre : '-';
  }
}

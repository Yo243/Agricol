import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ParcelasService } from '../services/parcelas.service';
import { FormParcelaComponent } from '../components/form-parcela/form-parcela.component';  // ← AGREGAR
import {
  Parcela,
  EstadoParcela,
  getEstadoParcelaColor,
  formatearHectareas,
  ESTADOS_PARCELA
} from '../../../models/parcelas.model';

@Component({
  selector: 'app-parcelas',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, FormParcelaComponent],  // ← AGREGAR FormParcelaComponent
  templateUrl: './parcelas.component.html',
  styleUrl: './parcelas.component.css'
})
export class ParcelasComponent implements OnInit {
  // ... resto del código igual
}
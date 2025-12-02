// src/app/shared/prompt-dialog/prompt-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

export interface PromptDialogData {
  title?: string;
  message?: string;
  label?: string;
  placeholder?: string;
}

@Component({
  selector: 'app-prompt-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, FormsModule],
  template: `
    <div class="p-4 min-w-[300px] max-w-[420px]">
      <h2 class="text-lg font-semibold text-slate-800 mb-2">
        {{ data.title || 'Ingresa información' }}
      </h2>
    
      @if (data.message) {
        <p class="text-sm text-slate-600 mb-3">
          {{ data.message }}
        </p>
      }
    
      <mat-form-field appearance="outline" class="w-full mb-4">
        <mat-label>{{ data.label || 'Texto' }}</mat-label>
        <textarea
          matInput
          [(ngModel)]="value"
          [placeholder]="data.placeholder || ''"
          rows="3">
        </textarea>
      </mat-form-field>
    
      <div class="flex justify-end gap-2">
        <button mat-button (click)="onCancel()">Cancelar</button>
        <button mat-raised-button color="primary" (click)="onConfirm()">Aceptar</button>
      </div>
    </div>
    `,
})
export class PromptDialogComponent {
  value = '';

  constructor(
    private dialogRef: MatDialogRef<PromptDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PromptDialogData
  ) {}

  onConfirm() {
    this.dialogRef.close(this.value);     // string
  }

  onCancel() {
    this.dialogRef.close(null);           // usuario canceló
  }
}

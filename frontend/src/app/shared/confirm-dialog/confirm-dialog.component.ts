// src/app/shared/confirm-dialog/confirm-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';


export interface ConfirmDialogData {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <div class="p-4 min-w-[280px] max-w-[400px]">
      <h2 class="text-lg font-semibold text-slate-800 mb-2">
        {{ data.title || 'Confirmar acción' }}
      </h2>

      <p class="text-sm text-slate-600 mb-4">
        {{ data.message }}
      </p>

      <div class="flex justify-end gap-2">
        <button mat-button (click)="onCancel()">
          {{ data.cancelText || 'Cancelar' }}
        </button>

        <button mat-raised-button color="primary" (click)="onConfirm()">
          {{ data.confirmText || 'Aceptar' }}
        </button>
      </div>
    </div>
  `,
})
export class ConfirmDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  onConfirm() {
    this.dialogRef.close(true);
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}

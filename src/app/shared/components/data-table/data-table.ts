import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  computed,
} from '@angular/core';


export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
}
@Component({
  selector: 'app-data-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="table-responsive">
      <table class="table table-hover table-bordered align-middle">
        <thead class="table-dark">
          <tr>
            @for (col of columns(); track col.key) {
              <th
                [class.cursor-pointer]="col.sortable"
                (click)="col.sortable && toggleSort(col.key)"
              >
                {{ col.label }}
                @if (col.sortable) {
                  <i
                    class="ms-1 bi"
                    [class.bi-arrow-up]="sortKey() === col.key && sortDir() === 'asc'"
                    [class.bi-arrow-down]="sortKey() === col.key && sortDir() === 'desc'"
                    [class.bi-arrow-down-up]="sortKey() !== col.key"
                  ></i>
                }
              </th>
            }
          </tr>
        </thead>
        <tbody>
          @for (row of sortedData(); track row['id']) {
            <tr (click)="rowClick.emit(row)">
              @for (col of columns(); track col.key) {
                <td>{{ row[col.key] }}</td>
              }
            </tr>
          } @empty {
            <tr>
              <td [attr.colspan]="columns().length" class="text-center text-muted py-4">
                No data available
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class DataTableComponent {
  columns = input.required<TableColumn[]>();
  data = input.required<Record<string, unknown>[]>();
  rowClick = output<Record<string, unknown>>();
  sortKey = signal<string | null>(null);
  sortDir = signal<'asc' | 'desc'>('asc');
  sortedData = computed(() => {
    const key = this.sortKey();
    if (!key) return this.data();
    return [...this.data()].sort((a, b) => {
      const valA = a[key] ?? '';
      const valB = b[key] ?? '';
      const cmp = String(valA).localeCompare(String(valB));
      return this.sortDir() === 'asc' ? cmp : -cmp;
    });
  });
  toggleSort(key: string): void {
    if (this.sortKey() === key) {
      this.sortDir.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortKey.set(key);
      this.sortDir.set('asc');
    }
  }
}
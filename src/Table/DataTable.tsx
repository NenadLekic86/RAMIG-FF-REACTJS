import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';

type Props<TData extends object> = { columns: ColumnDef<TData, unknown>[]; data: TData[] };
export function DataTable<TData extends object>({ columns, data }: Props<TData>) {
  const table = useReactTable<TData>({ columns, data, getCoreRowModel: getCoreRowModel() });
  return (
    <table className="w-full border-separate border-spacing-0">
      <thead className="bg-neutral-900">
        {table.getHeaderGroups().map(hg => (
          <tr key={hg.id}>
            {hg.headers.map(h => (
              <th key={h.id} className="text-left px-3 py-2 border-b border-neutral-800">
                {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map(r => (
          <tr key={r.id} className="odd:bg-neutral-950 even:bg-neutral-900">
            {r.getVisibleCells().map(c => (
              <td key={c.id} className="px-3 py-2 border-b border-neutral-800">
                {flexRender(c.column.columnDef.cell, c.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
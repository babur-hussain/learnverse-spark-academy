
import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/UI/table';
import LoadingSpinner from '@/components/Layout/LoadingSpinner';

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (value: any, item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[] | undefined;
  columns: Column<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  getRowClassName?: (item: T) => string;
}

function DataTable<T extends Record<string, any>>({
  data,
  columns,
  isLoading = false,
  emptyMessage = "No data available",
  onRowClick,
  getRowClassName
}: DataTableProps<T>) {
  if (isLoading) {
    return <LoadingSpinner message="Loading data..." />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column, index) => (
            <TableHead key={index} className={column.className}>
              {column.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item, index) => (
          <TableRow 
            key={index}
            className={`${onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''} ${
              getRowClassName ? getRowClassName(item) : ''
            }`}
            onClick={() => onRowClick?.(item)}
          >
            {columns.map((column, colIndex) => {
              const value = typeof column.key === 'string' && column.key.includes('.') 
                ? column.key.split('.').reduce((obj, key) => obj?.[key], item)
                : item[column.key as keyof T];
              
              return (
                <TableCell key={colIndex} className={column.className}>
                  {column.render ? column.render(value, item) : value}
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default DataTable;

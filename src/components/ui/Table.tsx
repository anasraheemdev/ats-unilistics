import React from 'react';

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
  containerStyle?: React.CSSProperties;
}

export const Table: React.FC<TableProps> = ({ children, style, containerStyle, ...props }) => {
  return (
    <div
      style={{
        width: '100%',
        overflowX: 'auto',
        borderRadius: 'var(--radius-card, 24px)',
        border: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--surface-card)',
        boxShadow: 'var(--shadow-sm)',
        WebkitOverflowScrolling: 'touch',
        ...containerStyle,
      }}
    >
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          textAlign: 'left',
          fontSize: '0.875rem',
          fontFamily: 'var(--font-family-base)',
          color: 'var(--color-foreground)',
          ...style,
        }}
        {...props}
      >
        {children}
      </table>
    </div>
  );
};

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  children,
  style,
  ...props
}) => {
  return (
    <thead
      style={{
        backgroundColor: 'var(--surface-panel)',
        borderBottom: '1px solid var(--border-subtle)',
        ...style,
      }}
      {...props}
    >
      {children}
    </thead>
  );
};

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  children,
  style,
  ...props
}) => {
  return (
    <tbody style={{ ...style }} {...props}>
      {children}
    </tbody>
  );
};

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  isClickable?: boolean;
}

export const TableRow: React.FC<TableRowProps> = ({
  children,
  isClickable = false,
  style,
  ...props
}) => {
  return (
    <tr
      style={{
        borderBottom: '1px solid var(--border-subtle)',
        transition: 'background-color var(--transition-fast)',
        cursor: isClickable ? 'pointer' : 'default',
        ...style,
      }}
      className="table-row-hoverable"
      {...props}
    >
      {children}
    </tr>
  );
};

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({
  children,
  style,
  ...props
}) => {
  return (
    <th
      scope="col"
      style={{
        padding: '0.875rem 1.25rem',
        fontWeight: 600,
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: 'var(--color-foreground-muted)',
        whiteSpace: 'nowrap',
        ...style,
      }}
      {...props}
    >
      {children}
    </th>
  );
};

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
  children,
  style,
  ...props
}) => {
  return (
    <td
      style={{
        padding: '1rem 1.25rem',
        verticalAlign: 'middle',
        lineHeight: 1.5,
        ...style,
      }}
      {...props}
    >
      {children}
    </td>
  );
};

export default Table;

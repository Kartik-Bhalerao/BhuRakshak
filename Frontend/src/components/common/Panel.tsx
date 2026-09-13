import type { ReactNode } from 'react';

interface PanelProps {
  title?: string;
  children: ReactNode;
  className?: string;
  headerExtra?: ReactNode;
  noPadding?: boolean;
}

export default function Panel({
  title,
  children,
  className = '',
  headerExtra,
  noPadding = false,
}: PanelProps) {
  return (
    <div className={`panel panel-hover ${className}`}>
      {title && (
        <div className="panel-header">
          <h3 className="panel-title">{title}</h3>
          {headerExtra}
        </div>
      )}
      <div className={noPadding ? '' : 'p-4'}>{children}</div>
    </div>
  );
}

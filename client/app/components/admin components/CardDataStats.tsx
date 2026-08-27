import React, { ReactNode } from "react";

interface CardDataStatsProps {
  title: string;
  total: number;
  children: ReactNode;
}

const CardDataStats: React.FC<CardDataStatsProps> = ({
  title,
  total,
  children,
}) => {
  return (
    <div className="rounded-lg border border-border bg-card px-7.5 py-6 shadow-sm">
      <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-primary/10">
        {children}
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <h4 className="text-2xl font-bold text-foreground">
            {total}
          </h4>
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
        </div>
      </div>
    </div>
  );
};

export default CardDataStats;

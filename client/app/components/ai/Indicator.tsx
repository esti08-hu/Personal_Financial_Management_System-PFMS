"use client";

import React from 'react';
import { AlertCircle, CheckCircle, Loader2, RefreshCw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface IndicatorProps {
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
  onClear?: () => void;
  className?: string;
}

const Indicator: React.FC<IndicatorProps> = ({
  isLoading,
  error,
  onRetry,
  onClear,
  className
}) => {
  if (error) {
    return (
      <Alert variant="destructive" className={cn("mb-2", className)}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span className="text-sm">{error}</span>
          <div className="flex gap-2 ml-4">
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="h-6 px-2 text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            )}
            {onClear && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClear}
                className="h-6 px-2 text-xs"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-muted-foreground py-2", className)}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>AI is thinking...</span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2 text-sm text-muted-foreground py-2", className)}>
      <CheckCircle className="h-4 w-4 text-green-500" />
      <span>Ready to help with your finances</span>
    </div>
  );
};

export default Indicator;
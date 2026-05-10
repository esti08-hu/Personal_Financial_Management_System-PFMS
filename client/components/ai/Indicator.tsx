import React from 'react';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';
import { AlertCircle, CheckCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'error' | 'loading';
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function StatusIndicator({
  status,
  message,
  onRetry,
  className
}: StatusIndicatorProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'online':
        return {
          icon: CheckCircle,
          variant: 'default' as const,
          text: 'Online',
          color: 'text-green-600',
        };
      case 'offline':
        return {
          icon: WifiOff,
          variant: 'secondary' as const,
          text: 'Offline',
          color: 'text-orange-600',
        };
      case 'error':
        return {
          icon: AlertCircle,
          variant: 'destructive' as const,
          text: 'Error',
          color: 'text-red-600',
        };
      case 'loading':
        return {
          icon: RefreshCw,
          variant: 'secondary' as const,
          text: 'Connecting...',
          color: 'text-blue-600',
        };
      default:
        return {
          icon: AlertCircle,
          variant: 'secondary' as const,
          text: 'Unknown',
          color: 'text-gray-600',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className={cn("h-3 w-3", status === 'loading' && "animate-spin")} />
        {config.text}
      </Badge>

      {message && (
        <span className="text-sm text-muted-foreground">
          {message}
        </span>
      )}

      {status === 'error' && onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="h-6 px-2 text-xs"
        >
          Retry
        </Button>
      )}
    </div>
  );
}

interface ErrorAlertProps {
  error: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function ErrorAlert({ error, onRetry, onDismiss, className }: ErrorAlertProps) {
  return (
    <Alert variant="destructive" className={cn("mb-4", className)}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>{error}</span>
        <div className="flex gap-2 ml-4">
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          )}
          {onDismiss && (
            <Button variant="ghost" size="sm" onClick={onDismiss}>
              Dismiss
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}

interface ConnectionIndicatorProps {
  isConnected: boolean;
  lastConnected?: Date;
  className?: string;
}

export function ConnectionIndicator({ isConnected, lastConnected, className }: ConnectionIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-2 text-sm", className)}>
      {isConnected ? (
        <>
          <Wifi className="h-4 w-4 text-green-600" />
          <span className="text-green-600">Connected</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-red-600" />
          <span className="text-red-600">Disconnected</span>
          {lastConnected && (
            <span className="text-muted-foreground">
              (last connected {lastConnected.toLocaleTimeString()})
            </span>
          )}
        </>
      )}
    </div>
  );
}
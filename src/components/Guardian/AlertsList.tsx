
import React from 'react';
import { useGuardian } from '@/contexts/GuardianContext';
import { GuardianService } from '@/services/GuardianService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/UI/card';
import { Badge } from '@/components/UI/badge';
import { Button } from '@/components/UI/button';
import { Bell, CheckCircle, AlertTriangle, AlertCircle, Eye } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const AlertsList: React.FC = () => {
  const { alerts, refreshData, currentStudent } = useGuardian();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState<{[key: string]: boolean}>({});

  const handleMarkAsRead = async (alertId: string) => {
    setIsLoading(prev => ({ ...prev, [alertId]: true }));
    try {
      const success = await GuardianService.markAlertAsRead(alertId);
      if (success) {
        toast({
          title: "Alert marked as read",
          description: "The alert has been marked as read.",
        });
        refreshData();
      }
    } catch (error) {
      console.error('Error marking alert as read:', error);
      toast({
        title: "Error",
        description: "Could not mark the alert as read. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(prev => ({ ...prev, [alertId]: false }));
    }
  };

  const getAlertIcon = (severity: string, isRead: boolean) => {
    const className = `h-6 w-6 ${isRead ? 'text-muted-foreground/50' : ''}`;
    
    switch (severity) {
      case 'critical':
        return <AlertCircle className={`${className} text-red-500`} />;
      case 'warning':
        return <AlertTriangle className={`${className} text-amber-500`} />;
      default:
        return <Bell className={`${className} text-blue-500`} />;
    }
  };

  const formatAlertDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      relative: formatDistanceToNow(date, { addSuffix: true }),
      formatted: format(date, 'PPp')
    };
  };

  if (!currentStudent) {
    return null;
  }

  const filteredAlerts = currentStudent 
    ? alerts.filter(alert => alert.student_id === currentStudent.student_id)
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Alerts & Notifications
        </CardTitle>
        <CardDescription>
          Important updates about {currentStudent?.student?.full_name}'s academic progress
        </CardDescription>
      </CardHeader>
      <CardContent>
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
            <p>No alerts at this time</p>
            <p className="text-sm mt-2">We'll notify you of important updates</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAlerts.map(alert => {
              const isRead = !!alert.read_at;
              const alertDate = formatAlertDate(alert.created_at);
              
              return (
                <div 
                  key={alert.id} 
                  className={`p-4 border rounded-lg ${
                    isRead ? 'bg-muted/50' : 'bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getAlertIcon(alert.severity, isRead)}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className={`font-medium ${isRead ? 'text-muted-foreground' : ''}`}>
                            {alert.title}
                          </h4>
                          <div className="text-xs text-muted-foreground mt-1">
                            {alertDate.relative} · {alertDate.formatted}
                          </div>
                        </div>
                        <Badge 
                          variant={
                            alert.severity === 'critical' ? 'destructive' : 
                            alert.severity === 'warning' ? 'default' : 
                            'outline'
                          }
                          className="capitalize"
                        >
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className={`mt-2 text-sm ${isRead ? 'text-muted-foreground' : ''}`}>
                        {alert.message}
                      </p>
                      
                      {!isRead && (
                        <div className="mt-3 flex justify-end">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleMarkAsRead(alert.id)}
                            disabled={isLoading[alert.id]}
                          >
                            <Eye className="h-3.5 w-3.5 mr-1.5" />
                            Mark as Read
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AlertsList;

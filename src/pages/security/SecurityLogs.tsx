// src/pages/security/SecurityLogs.tsx

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Download, Calendar } from "lucide-react";
import { format, subMonths, subWeeks, subYears, isAfter, isWithinInterval } from 'date-fns';
import { useLocationFilter } from '@/hooks/useLocationFilter';
import { getSecurityLogs, SecurityLog } from '@/utils/securityLogger';
import { useMemo } from 'react';

export function SecurityLogs() {
  const { filterByLocation } = useLocationFilter();
  const allLogs = getSecurityLogs();
  
  // Filter logs by location for security users
  // Security only handles key issuance and vehicle returns
  const securityRelevantLogs = allLogs.filter(log => 
    log.type === 'Key Issued' || log.type === 'Vehicle Returned'
  );
  
  const locationFilteredLogs = filterByLocation(securityRelevantLogs.map(log => ({
    ...log,
    location: log.booking.location
  })));
  
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('all');
  
  // Get date range based on filter selection
  const getDateRange = useMemo(() => {
    const now = new Date();
    switch (dateRangeFilter) {
      case 'last-week':
        return { start: subWeeks(now, 1), end: now };
      case 'last-month':
        return { start: subMonths(now, 1), end: now };
      case 'last-3months':
        return { start: subMonths(now, 3), end: now };
      case 'last-6months':
        return { start: subMonths(now, 6), end: now };
      case 'last-year':
        return { start: subYears(now, 1), end: now };
      default:
        return null; // 'all' - no date filtering
    }
  }, [dateRangeFilter]);
  
  // Filter logs
  const filteredLogs = useMemo(() => {
    return locationFilteredLogs.filter(log => {
      const matchesSearch = 
        log.trainer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.vehicle.regNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.booking.bookingRef.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = typeFilter === 'all' || log.type === typeFilter;
      
      // Date range filter
      const matchesDate = !getDateRange || isWithinInterval(
        new Date(log.timestamp),
        { start: getDateRange.start, end: getDateRange.end }
      );
      
      return matchesSearch && matchesType && matchesDate;
    });
  }, [locationFilteredLogs, searchTerm, typeFilter, getDateRange]);
  
  // Export to CSV with proper formatting
  const exportToCSV = () => {
    const headers = [
      "Type",
      "Timestamp",
      "Security Officer",
      "Trainer",
      "Vehicle Brand",
      "Vehicle Model",
      "Registration No",
      "Booking Ref",
      "Purpose",
      "Expected Return Date",
      "Actual Return Date",
      "Return Notes",
      "Location"
    ];

    // Get date range label for filename
    const getDateRangeLabel = () => {
      switch (dateRangeFilter) {
        case 'last-week':
          return 'Last_Week';
        case 'last-month':
          return 'Last_Month';
        case 'last-3months':
          return 'Last_3_Months';
        case 'last-6months':
          return 'Last_6_Months';
        case 'last-year':
          return 'Last_Year';
        default:
          return 'All_Time';
      }
    };

    const rows = filteredLogs.map((log) => [
      log.type,
      format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss'),
      log.securityOfficer.name,
      log.trainer.name,
      log.vehicle.brand,
      log.vehicle.model,
      log.vehicle.regNo,
      log.booking.bookingRef,
      log.booking.purpose,
      format(new Date(log.booking.expectedReturnDate), 'yyyy-MM-dd HH:mm'),
      log.booking.actualReturnDate ? format(new Date(log.booking.actualReturnDate), 'yyyy-MM-dd HH:mm') : '',
      log.notes || (log.damageReport && log.damageReport !== 'No damage reported' ? log.damageReport : '') || '',
      log.booking.location || ''
    ]);

    // Escape CSV values properly
    const escapeCsvValue = (value: string) => {
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    const csvContent =
      [headers.map(escapeCsvValue), ...rows.map(row => row.map(v => escapeCsvValue(String(v))))]
        .map((row) => row.join(","))
        .join("\n");

    // Add BOM for Excel compatibility
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const dateRangeLabel = getDateRangeLabel();
    const filename = `security_logs_${dateRangeLabel}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'Key Issued':
        return <Badge className="bg-blue-600 text-white">Key Issued</Badge>;
      case 'Vehicle Returned':
        return <Badge className="bg-green-600 text-white">Vehicle Returned</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in p-6">
      <Card className="shadow-lg rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">Security Logs</CardTitle>
            <CardDescription>
              Audit trail of key issuance and vehicle return transactions
            </CardDescription>
          </div>
          <Button 
            onClick={exportToCSV} 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={filteredLogs.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Logs ({filteredLogs.length})
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by trainer, vehicle, or booking reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Key Issued">Key Issued</SelectItem>
                <SelectItem value="Vehicle Returned">Vehicle Returned</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
              <SelectTrigger className="w-[200px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Time Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="last-week">Last Week</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="last-3months">Last 3 Months</SelectItem>
                <SelectItem value="last-6months">Last 6 Months</SelectItem>
                <SelectItem value="last-year">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Logs Table */}
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg">No security logs found</p>
              <p className="text-sm mt-2">
                {allLogs.length === 0 
                  ? 'Logs will appear here when actions are performed.' 
                  : 'Try adjusting your search or filters.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Security Officer</TableHead>
                    <TableHead>Trainer</TableHead>
                    <TableHead>Vehicle Details</TableHead>
                    <TableHead>Booking Ref</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        {getTypeBadge(log.type)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">{format(new Date(log.timestamp), 'MMM dd, yyyy')}</p>
                          <p className="text-muted-foreground">{format(new Date(log.timestamp), 'hh:mm a')}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{log.securityOfficer.name}</p>
                          <p className="text-xs text-muted-foreground">{log.securityOfficer.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{log.trainer.name}</p>
                          <p className="text-xs text-muted-foreground">ID: {log.trainer.id}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {log.vehicle.brand} {log.vehicle.model}
                          </p>
                          <p className="text-sm text-muted-foreground">{log.vehicle.regNo}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">{log.booking.bookingRef}</p>
                          <p className="text-xs text-muted-foreground">{log.booking.purpose}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{log.booking.location}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm max-w-xs">
                          {log.type === 'Key Issued' && (
                            <>
                              <p>
                                <span className="font-medium">Expected Return:</span>{' '}
                                {format(new Date(log.booking.expectedReturnDate), 'MMM dd, yyyy HH:mm')}
                              </p>
                              {log.notes && (
                                <p className="text-muted-foreground">
                                  <span className="font-medium">Notes:</span> {log.notes}
                                </p>
                              )}
                            </>
                          )}
                          {log.type === 'Vehicle Returned' && (
                            <>
                              <p>
                                <span className="font-medium">Expected:</span>{' '}
                                {format(new Date(log.booking.expectedReturnDate), 'MMM dd, yyyy HH:mm')}
                              </p>
                              <p>
                                <span className="font-medium">Actual:</span>{' '}
                                {log.booking.actualReturnDate 
                                  ? format(new Date(log.booking.actualReturnDate), 'MMM dd, yyyy HH:mm')
                                  : 'N/A'}
                              </p>
                              {log.damageReport && log.damageReport !== 'No damage reported' && (
                                <p className="text-orange-600">
                                  <span className="font-medium">Damage Note:</span> {log.damageReport}
                                </p>
                              )}
                              {log.notes && (
                                <p className="text-muted-foreground">
                                  <span className="font-medium">Notes:</span> {log.notes}
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

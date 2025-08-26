// src/pages/security/SecurityLogs.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Mock Security Logs Data with Location
const mockLogs = [
  {
    id: 1,
    type: "Key Issued",
    timestamp: "2025-08-24 09:15 AM",
    securityOfficer: "Alice Smith",
    trainer: "John Doe",
    vehicle: { brand: "Skoda", model: "Octavia", regNo: "MH12AB1234" },
    bookingRef: "BK-00123",
    expectedReturnDate: "2025-08-25",
    location: "Pune Training Center - Gate A",
  },
  {
    id: 2,
    type: "Vehicle Returned",
    timestamp: "2025-08-24 11:45 AM",
    securityOfficer: "Bob Johnson",
    trainer: "Jane Miller",
    vehicle: { brand: "Skoda", model: "Rapid", regNo: "MH14XY5678" },
    actualReturnDate: "2025-08-24",
    damageReport: "No damage reported",
    location: "Pune Training Center - Parking Lot",
  },
  {
    id: 3,
    type: "Key Issued",
    timestamp: "2025-08-24 01:30 PM",
    securityOfficer: "Alice Smith",
    trainer: "David Clark",
    vehicle: { brand: "Volkswagen", model: "Polo", regNo: "MH20ZZ9988" },
    bookingRef: "BK-00124",
    expectedReturnDate: "2025-08-26",
    location: "Mumbai Office - Gate 3",
  },
  {
    id: 4,
    type: "Vehicle Returned",
    timestamp: "2025-08-24 04:20 PM",
    securityOfficer: "Bob Johnson",
    trainer: "Sophia White",
    vehicle: { brand: "Skoda", model: "Superb", regNo: "MH31CD4321" },
    actualReturnDate: "2025-08-24",
    damageReport: "Minor scratch on rear bumper",
    location: "Mumbai Office - Service Bay",
  },
  {
    id: 5,
    type: "Key Issued",
    timestamp: "2025-08-24 06:10 PM",
    securityOfficer: "Rajesh Kumar",
    trainer: "Neha Verma",
    vehicle: { brand: "Skoda", model: "Kushaq", regNo: "MH12EF6543" },
    bookingRef: "BK-00125",
    expectedReturnDate: "2025-08-27",
    location: "Pune Training Center - Gate B",
  },
  {
    id: 6,
    type: "Vehicle Returned",
    timestamp: "2025-08-24 07:45 PM",
    securityOfficer: "Priya Singh",
    trainer: "Amit Sharma",
    vehicle: { brand: "Volkswagen", model: "Virtus", regNo: "MH14GH1122" },
    actualReturnDate: "2025-08-24",
    damageReport: "Fuel tank low, otherwise fine",
    location: "Mumbai Office - Parking Bay 2",
  },
  {
    id: 7,
    type: "Key Issued",
    timestamp: "2025-08-25 08:20 AM",
    securityOfficer: "Rajesh Kumar",
    trainer: "Anjali Mehta",
    vehicle: { brand: "Skoda", model: "Slavia", regNo: "MH20IJ7788" },
    bookingRef: "BK-00126",
    expectedReturnDate: "2025-08-26",
    location: "Pune Training Center - Gate A",
  },
  {
    id: 8,
    type: "Vehicle Returned",
    timestamp: "2025-08-25 10:15 AM",
    securityOfficer: "Priya Singh",
    trainer: "Rohit Patil",
    vehicle: { brand: "Volkswagen", model: "Taigun", regNo: "MH31KL9900" },
    actualReturnDate: "2025-08-25",
    damageReport: "Left mirror broken",
    location: "Mumbai Office - Gate 1",
  },
  {
    id: 9,
    type: "Key Issued",
    timestamp: "2025-08-25 11:45 AM",
    securityOfficer: "Alice Smith",
    trainer: "Meera Nair",
    vehicle: { brand: "Skoda", model: "Kodiaq", regNo: "MH12MN4567" },
    bookingRef: "BK-00127",
    expectedReturnDate: "2025-08-28",
    location: "Pune Training Center - Gate C",
  },
  {
    id: 10,
    type: "Vehicle Returned",
    timestamp: "2025-08-25 01:00 PM",
    securityOfficer: "Bob Johnson",
    trainer: "Arjun Reddy",
    vehicle: { brand: "Volkswagen", model: "Passat", regNo: "MH14OP3344" },
    actualReturnDate: "2025-08-25",
    damageReport: "No damage reported",
    location: "Mumbai Office - Parking Bay 4",
  },
];


// Function to export logs as CSV
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
    "Expected Return Date",
    "Actual Return Date",
    "Damage Report",
    "Location",
  ];

  const rows = mockLogs.map((log) => [
    log.type,
    log.timestamp,
    log.securityOfficer,
    log.trainer,
    log.vehicle.brand,
    log.vehicle.model,
    log.vehicle.regNo,
    log.bookingRef || "",
    log.expectedReturnDate || "",
    log.actualReturnDate || "",
    log.damageReport || "",
    log.location || "",
  ]);

  const csvContent =
    [headers, ...rows].map((row) => row.join(",")).join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "security_logs.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export function SecurityLogs() {
  return (
    <div className="p-6">
      <Card className="shadow-lg rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-bold">Security Logs</CardTitle>
          <Button onClick={exportToCSV} className="bg-blue-600 hover:bg-blue-700 text-white">
            Export Logs
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Security Officer</TableHead>
                <TableHead>Trainer</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Location</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <Badge
                      className={
                        log.type === "Key Issued"
                          ? "bg-blue-600 text-white"
                          : "bg-green-600 text-white"
                      }
                    >
                      {log.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{log.timestamp}</TableCell>
                  <TableCell>{log.securityOfficer}</TableCell>
                  <TableCell>{log.trainer}</TableCell>
                  <TableCell>
                    {log.vehicle.brand} {log.vehicle.model} <br />
                    <span className="text-sm text-muted-foreground">{log.vehicle.regNo}</span>
                  </TableCell>
                  <TableCell>
                    {log.type === "Key Issued" ? (
                      <div className="space-y-1">
                        <p>
                          <span className="font-medium">Booking Ref:</span> {log.bookingRef}
                        </p>
                        <p>
                          <span className="font-medium">Expected Return:</span>{" "}
                          {log.expectedReturnDate}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p>
                          <span className="font-medium">Actual Return:</span>{" "}
                          {log.actualReturnDate}
                        </p>
                        <p>
                          <span className="font-medium">Damage Report:</span>{" "}
                          {log.damageReport}
                        </p>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{log.location}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

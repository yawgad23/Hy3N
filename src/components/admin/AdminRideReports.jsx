import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { AlertTriangle, AlertCircle, XCircle, Clock, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const SEVERITY_COLORS = {
  low: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
  high: "bg-orange-500/10 text-orange-500 border-orange-500/30",
  critical: "bg-red-500/10 text-red-500 border-red-500/30"
};

const STATUS_COLORS = {
  submitted: "bg-gray-500/10 text-gray-500 border-gray-500/30",
  under_review: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  resolved: "bg-green-500/10 text-green-500 border-green-500/30",
  dismissed: "bg-red-500/10 text-red-500 border-red-500/30"
};

const TYPE_ICONS = {
  driver_behavior: AlertTriangle,
  lost_item: Search,
  cheating: AlertCircle,
  other: XCircle
};

export default function AdminRideReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const data = await base44.asServiceRole.entities.RideReport.list("-created_date", 100);
      setReports(data);
    } catch (err) {
      console.error("Failed to load reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (reportId, newStatus) => {
    try {
      await base44.asServiceRole.entities.RideReport.update(reportId, {
        status: newStatus,
        resolved_at: newStatus === "resolved" || newStatus === "dismissed" ? new Date().toISOString() : null
      });
      await loadReports();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesStatus = filterStatus === "all" || report.status === filterStatus;
    const matchesType = filterType === "all" || report.report_type === filterType;
    const matchesSearch = searchQuery === "" ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  const stats = {
    total: reports.length,
    submitted: reports.filter(r => r.status === "submitted").length,
    under_review: reports.filter(r => r.status === "under_review").length,
    resolved: reports.filter(r => r.status === "resolved").length,
    critical: reports.filter(r => r.severity === "critical" && r.status !== "resolved").length
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="font-heading font-bold text-2xl mb-2">Ride Reports</h1>
        <p className="text-muted-foreground">Manage rider reports and complaints</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Total</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Submitted</p>
          <p className="text-2xl font-bold text-gray-500">{stats.submitted}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Under Review</p>
          <p className="text-2xl font-bold text-blue-500">{stats.under_review}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Resolved</p>
          <p className="text-2xl font-bold text-green-500">{stats.resolved}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Critical</p>
          <p className="text-2xl font-bold text-red-500">{stats.critical}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-secondary border-none"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px] bg-secondary border-none">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="driver_behavior">Driver Behavior</SelectItem>
            <SelectItem value="lost_item">Lost & Found</SelectItem>
            <SelectItem value="cheating">Cheating</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px] bg-secondary border-none">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No reports found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReports.map((report) => {
            const TypeIcon = TYPE_ICONS[report.report_type] || AlertTriangle;
            return (
              <div
                key={report.id}
                className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors cursor-pointer"
                onClick={() => setSelectedReport(report)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      SEVERITY_COLORS[report.severity]
                    }`}>
                      <TypeIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold capitalize">
                          {report.report_type.replace('_', ' ')}
                        </h3>
                        <Badge variant="outline" className={`text-xs ${SEVERITY_COLORS[report.severity]}`}>
                          {report.severity}
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${STATUS_COLORS[report.status]}`}>
                          {report.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {report.description.slice(0, 100)}{report.description.length > 100 ? '...' : ''}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Ride: {report.ride_id.slice(0, 8)}...</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(report.created_date), "MMM d, yyyy h:mm a")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {report.status === "submitted" && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusUpdate(report.id, "under_review");
                        }}
                        className="bg-blue-500 hover:bg-blue-600"
                      >
                        Review
                      </Button>
                    )}
                    {report.status === "under_review" && (
                      <>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusUpdate(report.id, "resolved");
                          }}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          Resolve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusUpdate(report.id, "dismissed");
                          }}
                        >
                          Dismiss
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
            <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
              <h2 className="font-heading font-bold text-lg">Report Details</h2>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-2 hover:bg-secondary rounded-full transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Report Type</p>
                  <p className="font-medium capitalize">{selectedReport.report_type.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Category</p>
                  <p className="font-medium capitalize">{selectedReport.category.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Severity</p>
                  <Badge variant="outline" className={`text-xs ${SEVERITY_COLORS[selectedReport.severity]}`}>
                    {selectedReport.severity}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <Badge variant="outline" className={`text-xs ${STATUS_COLORS[selectedReport.status]}`}>
                    {selectedReport.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">Description</p>
                <p className="text-sm">{selectedReport.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Ride ID</p>
                  <p className="font-mono text-sm">{selectedReport.ride_id}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Submitted</p>
                  <p className="text-sm">{format(new Date(selectedReport.created_date), "MMM d, yyyy h:mm a")}</p>
                </div>
              </div>

              {selectedReport.admin_notes && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Admin Notes</p>
                  <p className="text-sm bg-secondary p-3 rounded-lg">{selectedReport.admin_notes}</p>
                </div>
              )}

              {selectedReport.status !== "submitted" && selectedReport.resolved_at && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Resolved At</p>
                  <p className="text-sm">{format(new Date(selectedReport.resolved_at), "MMM d, yyyy h:mm a")}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-border">
                {selectedReport.status === "submitted" && (
                  <Button
                    onClick={() => {
                      handleStatusUpdate(selectedReport.id, "under_review");
                      setSelectedReport(null);
                    }}
                    className="flex-1 bg-blue-500 hover:bg-blue-600"
                  >
                    Mark as Under Review
                  </Button>
                )}
                {selectedReport.status === "under_review" && (
                  <>
                    <Button
                      onClick={() => {
                        handleStatusUpdate(selectedReport.id, "resolved");
                        setSelectedReport(null);
                      }}
                      className="flex-1 bg-green-500 hover:bg-green-600"
                    >
                      Mark as Resolved
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleStatusUpdate(selectedReport.id, "dismissed");
                        setSelectedReport(null);
                      }}
                      className="flex-1"
                    >
                      Dismiss Report
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
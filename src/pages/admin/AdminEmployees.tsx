import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, Search, Users, Mail, Calendar, MapPin, 
  Phone, FileText, Briefcase, ChevronLeft, ChevronRight
} from 'lucide-react';

interface Employee {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  location: string | null;
  bio: string | null;
  skills: string[];
  experience_years: number;
  resume_url: string | null;
  availability: string;
  created_at: string;
  user: {
    email: string;
    created_at: string;
  };
  applications_count: number;
}

const ITEMS_PER_PAGE = 50;

const AdminEmployees = () => {
  const { toast } = useToast();
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  
  // View modal
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      // Get total count
      const { count } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true });

      setTotalCount(count || 0);

      // Fetch paginated data
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data: employeesData, error } = await supabase
        .from('employees')
        .select(`
          *,
          user:users(email, created_at)
        `)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      // Fetch applications count for each employee
      const employeesWithCounts = await Promise.all(
        (employeesData || []).map(async (emp: any) => {
          const { count } = await supabase
            .from('job_applications')
            .select('*', { count: 'exact', head: true })
            .eq('employee_id', emp.id);

          return {
            ...emp,
            applications_count: count || 0,
          };
        })
      );

      setEmployees(employeesWithCounts);
      setFilteredEmployees(employeesWithCounts);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [currentPage]);

  useEffect(() => {
    let result = [...employees];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(emp => 
        emp.first_name?.toLowerCase().includes(query) ||
        emp.last_name?.toLowerCase().includes(query) ||
        emp.user?.email?.toLowerCase().includes(query) ||
        emp.location?.toLowerCase().includes(query) ||
        emp.skills?.some(s => s.toLowerCase().includes(query))
      );
    }

    setFilteredEmployees(result);
  }, [employees, searchQuery]);

  const handleView = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsViewModalOpen(true);
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading && employees.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Employees Management</h1>
        <p className="text-muted-foreground">View and manage all registered employees</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold">{totalCount}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">With Complete Profiles</p>
                <p className="text-2xl font-bold">
                  {employees.filter(e => e.first_name && e.last_name && e.skills?.length > 0).length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Applications</p>
                <p className="text-2xl font-bold">
                  {employees.reduce((sum, e) => sum + e.applications_count, 0)}
                </p>
              </div>
              <Briefcase className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, location, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Employees List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Employees</CardTitle>
              <CardDescription>
                Showing {filteredEmployees.length} of {totalCount} employees (Page {currentPage} of {totalPages || 1})
              </CardDescription>
            </div>
            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1 || isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {currentPage} / {totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages || isLoading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No employees found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEmployees.map((employee) => (
                <div
                  key={employee.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => handleView(employee)}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {employee.first_name?.[0] || employee.user?.email[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">
                          {employee.first_name && employee.last_name 
                            ? `${employee.first_name} ${employee.last_name}`
                            : employee.user?.email}
                        </h3>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {employee.user?.email}
                        </span>
                        {employee.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {employee.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">{employee.applications_count} applications</p>
                      <p className="text-xs text-muted-foreground">
                        Joined {formatDate(employee.user?.created_at || employee.created_at)}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bottom Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1 || isLoading}
              >
                First
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1 || isLoading}
              >
                Previous
              </Button>
              <span className="px-4 text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages || isLoading}
              >
                Next
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage >= totalPages || isLoading}
              >
                Last
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Employee Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Employee Profile</DialogTitle>
            <DialogDescription>
              Detailed information about this employee
            </DialogDescription>
          </DialogHeader>

          {selectedEmployee && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-medium">
                    {selectedEmployee.first_name?.[0] || selectedEmployee.user?.email[0]?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">
                    {selectedEmployee.first_name && selectedEmployee.last_name 
                      ? `${selectedEmployee.first_name} ${selectedEmployee.last_name}`
                      : 'Name not provided'}
                  </h3>
                  <p className="text-muted-foreground">{selectedEmployee.user?.email}</p>
                  {selectedEmployee.location && (
                    <p className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3" /> {selectedEmployee.location}
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Contact & Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {selectedEmployee.phone || 'Not provided'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Experience</p>
                  <p>{selectedEmployee.experience_years || 0} years</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Availability</p>
                  <Badge variant="outline" className="capitalize">
                    {selectedEmployee.availability || 'Not specified'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Applications</p>
                  <p>{selectedEmployee.applications_count} submitted</p>
                </div>
              </div>

              <Separator />

              {/* Bio */}
              {selectedEmployee.bio && (
                <>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Bio</p>
                    <p className="text-sm whitespace-pre-wrap">{selectedEmployee.bio}</p>
                  </div>
                  <Separator />
                </>
              )}

              {/* Skills */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Skills</p>
                {selectedEmployee.skills?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedEmployee.skills.map((skill, idx) => (
                      <Badge key={idx} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No skills listed</p>
                )}
              </div>

              <Separator />

              {/* Resume */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Resume</p>
                {selectedEmployee.resume_url ? (
                  <Button variant="outline" asChild>
                    <a href={selectedEmployee.resume_url} target="_blank" rel="noopener noreferrer">
                      <FileText className="h-4 w-4 mr-2" />
                      View Resume
                    </a>
                  </Button>
                ) : (
                  <p className="text-sm text-muted-foreground">No resume uploaded</p>
                )}
              </div>

              {/* Timestamps */}
              <div className="pt-4 border-t text-xs text-muted-foreground">
                <p>Account created: {formatDate(selectedEmployee.user?.created_at || selectedEmployee.created_at)}</p>
                <p>Profile updated: {formatDate(selectedEmployee.created_at)}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminEmployees;

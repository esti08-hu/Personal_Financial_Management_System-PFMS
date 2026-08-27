import { useState } from "react";
import { ArrowUpCircle, PencilLine, Trash2 } from "lucide-react";
import type { User } from "@/app/types/user";
import apiClient from "@/app/lib/axiosConfig";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const TableThree: React.FC<{ users: User[]; fetchUsers: () => void }> = ({
  users,
  fetchUsers,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedUsers = users.slice(startIndex, endIndex);
  const totalPages = Math.ceil(users.length / pageSize);

  const handleDelete = async (user: User) => {
    if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      try {
        const response = await apiClient.delete(`/user/deleteUser${user.pid}`);
        if (response.status === 200) {
          toast.success(`User ${user.name} deleted successfully`);
          fetchUsers();
        } else {
          toast.error("Failed to delete user.");
        }
      } catch (error) {
        toast.error("An error occurred while deleting the user.");
      }
    }
  };

  const handleRestore = async (user: User) => {
    if (confirm("Are you sure you want to restore this user?")) {
      try {
        const response = await apiClient.post(`/user/restore${user.pid}`);
        if (response.status === 201) {
          toast.success(`User ${user.name} restored successfully`);
          fetchUsers();
        } else {
          toast.error("Failed to restore user.");
        }
      } catch (error) {
        toast.error("An error occurred while restoring the user.");
      }
    }
  };

  const handleEdit = (user: User) => {
    setEditUser(user);
    setSelectedRole(user.role);
    setEditModalVisible(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editUser && selectedRole !== editUser.role) {
      try {
        const response = await apiClient.put(
          `/user/update-role${editUser.pid}`,
          { role: selectedRole }
        );
        if (response.status === 200) {
          toast.success(`User ${editUser.name}'s role updated successfully`);
          setEditModalVisible(false);
          fetchUsers();
        } else {
          toast.error("Failed to update user role.");
        }
      } catch (error) {
        toast.error("An error occurred while updating the user.");
      }
    } else {
      setEditModalVisible(false);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card shadow-sm">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[220px]">Name</TableHead>
              <TableHead className="min-w-[150px]">Email</TableHead>
              <TableHead className="min-w-[150px]">Status</TableHead>
              <TableHead className="min-w-[120px]">Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.map((user) => (
              <TableRow key={user.pid}>
                <TableCell className="font-medium text-foreground">
                  {user.name}
                </TableCell>
                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                <TableCell>
                  <p
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                      !user.accountLockedUntil
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {!user.accountLockedUntil ? "Active" : "Locked"}
                  </p>
                </TableCell>
                <TableCell className="text-foreground">{user.role}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-3.5">
                    {user.deletedAt ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleRestore(user)}
                        className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20"
                      >
                        <ArrowUpCircle className="mr-2 h-4 w-4" />
                        Restore
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(user)}
                          className="hover:text-primary"
                        >
                          <PencilLine className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(user)}
                          className="hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={editModalVisible} onOpenChange={setEditModalVisible}>
        <DialogContent className="sm:max-w-[400px]">
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle>Edit User Role</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <p className="text-sm text-muted-foreground">Change the role for {editUser?.name}.</p>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                  <SelectItem value="USER">USER</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditModalVisible(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={editUser?.role === selectedRole}>
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Basic Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                <span className="font-medium">{Math.min(endIndex, users.length)}</span> of{" "}
                <span className="font-medium">{users.length}</span> results
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <Button
                  variant="outline"
                  className="rounded-r-none"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  className="rounded-l-none"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableThree;

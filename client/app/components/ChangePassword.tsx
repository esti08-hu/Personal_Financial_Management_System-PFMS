import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePasswordSchema } from "../common/validationSchema";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

interface ChangePasswordModalProps {
  isVisible: boolean;
  toggleModal: () => void;
  handleChangePassword: (values: ChangePasswordValues) => void;
}
interface ChangePasswordValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword?: string;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isVisible,
  toggleModal,
  handleChangePassword,
}) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Validate password using the schema or custom logic
  const validatePassword = (password: string) => {
    try {
      changePasswordSchema.parse({ newPassword: password });
      setErrors({});
      setIsPasswordValid(true);
    } catch (err) {
      setIsPasswordValid(false);
      if (err instanceof z.ZodError) {
        const fieldErrors: { [key: string]: string } = {};
        err.errors.forEach((error) => {
          fieldErrors[error.path[0] as string] = error.message;
        });
        setErrors(fieldErrors);
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    }
  };

  const onFinish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setErrors((prev) => ({ ...prev, currentPassword: "Required" }));
      return;
    }
    handleChangePassword({ currentPassword, newPassword });
    setCurrentPassword("");
    setNewPassword("");
  };

  return (
    <Dialog open={isVisible} onOpenChange={toggleModal}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>
        <form onSubmit={onFinish} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                placeholder="Enter your current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {errors.currentPassword && <p className="text-destructive text-sm">{errors.currentPassword}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  validatePassword(e.target.value);
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            <div className="min-h-[24px] mt-1">
              {newPassword.length > 0 && (
                <>
                  {errors?.newPassword && (
                    <p className="text-destructive text-sm">{errors.newPassword}</p>
                  )}
                  {isPasswordValid && !errors?.newPassword && (
                    <p className="text-emerald-500 text-sm">Password is valid</p>
                  )}
                </>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={toggleModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isPasswordValid || !currentPassword}>
              Submit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordModal;

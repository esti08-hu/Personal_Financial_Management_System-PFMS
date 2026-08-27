import Image from "next/image";
import type { User } from "@/app/types/user";

const TableTwo: React.FC<{ users: User[] }> = ({ users }) => {
  return (
    <div className="rounded-lg border border-border bg-card shadow-sm">
      <div className="px-4 py-6 md:px-6 xl:px-7.5">
        <h4 className="text-xl font-semibold text-foreground">
          New users
        </h4>
      </div>

      <div className="grid grid-cols-6 border-t border-border px-4 py-4.5 sm:grid-cols-8 md:px-6 2xl:px-7.5">
        <div className="col-span-3 flex items-center">
          <p className="font-medium text-muted-foreground">Name</p>
        </div>
        <div className="col-span-2 hidden items-center sm:flex">
          <p className="font-medium text-muted-foreground">Email</p>
        </div>
        <div className="col-span-2 flex items-center justify-center">
          <p className="font-medium text-muted-foreground">Email verified</p>
        </div>
        <div className="col-span-1 flex items-center">
          <p className="font-medium text-muted-foreground">Status</p>
        </div>
      </div>

      {users.map((user, key) => (
        <div
          className="grid grid-cols-6 border-t border-border px-4 py-4.5 sm:grid-cols-8 md:px-6 2xl:px-7.5"
          key={user.pid}
        >
          <div className="col-span-3 flex items-center">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="h-10 w-10 overflow-hidden rounded-full border border-border hidden sm:flex">
                <Image
                  src={user.profilePicture || "/images/user/user.png"}
                  width={40}
                  height={40}
                  alt="user"
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="text-sm font-medium text-foreground">{user.name}</p>
            </div>
          </div>
          <div className="col-span-2 hidden items-center sm:flex">
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div className="col-span-2 flex items-center justify-center">
            <p
              className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                user.isEmailConfirmed
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {user.isEmailConfirmed ? "Yes" : "No"}
            </p>
          </div>
          <div className="col-span-1 flex items-center">
            <p
              className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                !user.accountLockedUntil
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {!user.accountLockedUntil ? "Active" : "Locked"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TableTwo;

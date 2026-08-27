import type { TopUsers } from "@/app/types/user";

const TableOne: React.FC<{ users: TopUsers[] }> = ({ users }) => {
  return (
    <div className="rounded-lg border border-border bg-card px-5 pb-2.5 pt-6 shadow-sm sm:px-7.5 xl:pb-1">
      <h4 className="mb-6 text-xl font-semibold text-foreground">
        Top Users
      </h4>

      <div className="flex flex-col">
        <div className="grid grid-cols-2 rounded-md bg-muted sm:grid-cols-5 md:grid-co">
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium uppercase text-muted-foreground xsm:text-base">
              Name
            </h5>
          </div>
          <div className="hidden p-2.5 text-center sm:block xl:p-5">
            <h5 className="text-sm font-medium uppercase text-muted-foreground xsm:text-base">
              Email
            </h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium uppercase text-muted-foreground xsm:text-base">
              Transactions
            </h5>
          </div>
          <div className="hidden p-2.5 text-center sm:block xl:p-5">
            <h5 className="text-sm font-medium uppercase text-muted-foreground xsm:text-base">
              Budgets
            </h5>
          </div>
          <div className="hidden p-2.5 text-center sm:block xl:p-5">
            <h5 className="text-sm font-medium uppercase text-muted-foreground xsm:text-base">
              status
            </h5>
          </div>
        </div>

        {users.map((user, key) => (
          <div
            className={`grid grid-cols-2 sm:grid-cols-5 md:grid-cols-5${
              key === users.length - 1
                ? ""
                : " border-b border-border"
            }`}
            key={user.userEmail}
          >
            <div className="flex items-center gap-3 p-2.5 xl:p-5 md:grid-cols-4">
              <p className="hidden text-foreground sm:block">
                {user.userName}
              </p>
            </div>

            <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
              <p className="text-muted-foreground">
                {user.userEmail}
              </p>
            </div>

            <div className="flex items-center justify-center p-2.5 xl:p-5">
              <p className="text-emerald-500 font-medium">{user.transactionCount}</p>
            </div>

            <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
              <p className="text-primary font-medium">{user.budgetCount}</p>
            </div>

            <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
              <p
                className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                  !user.accountLockedUntil
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "bg-destructive/10 text-destructive"
                }`}
              >
                {" "}
                {!user.accountLockedUntil ? "Active" : "Locked"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableOne;

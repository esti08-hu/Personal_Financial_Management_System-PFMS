import Image from "next/image";

const TableTwo = ({ users }) => {
  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="px-4 py-6 md:px-6 xl:px-7.5">
        <h4 className="text-xl font-semibold text-black dark:text-white">
          New users
        </h4>
      </div>

      <div className="grid grid-cols-6 border-t border-stroke px-4 py-4.5 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5">
        <div className="col-span-3 flex items-center">
          <p className="font-medium">Name</p>
        </div>
        <div className="col-span-2 hidden items-center sm:flex">
          <p className="font-medium">Email</p>
        </div>
        <div className="col-span-2 flex items-center justify-center">
          <p className="font-medium">Email verified</p>
        </div>
        <div className="col-span-1 flex items-center">
          <p className="font-medium">Status</p>
        </div>
      </div>

      {users.map((user, key) => (
        <div
          className="grid grid-cols-6 border-t border-stroke px-4 py-4.5 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5"
          key={key}
        >
          <div className="col-span-3 flex items-center">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="h-10 w-10 rounded-md hidden sm:flex">
                <Image
                  src={user.profilePicture || "/images/user/user.png"}
                  width={40}
                  height={50}
                  alt="user"
                />
              </div>
              <p className="text-sm text-black dark:text-white">{user.name}</p>
            </div>
          </div>
          <div className="col-span-2 hidden items-center sm:flex">
            <p className="text-sm text-black dark:text-white">{user.email}</p>
          </div>
          <div className="col-span-2 flex items-center justify-center">
            <p
              className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${
                user.isEmailConfirmed
                  ? "bg-success text-success"
                  : "bg-warning text-warning"
              }`}
            >
              {user.isEmailConfirmed ? "Yes" : "No"}
            </p>
          </div>
          <div className="col-span-1 flex items-center">
            <p
              className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${
                !user.accountLockedUntil
                  ? "bg-success text-success"
                  : "bg-warning text-warning"
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

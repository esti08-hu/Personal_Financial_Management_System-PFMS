
import { HiOutlineX } from "react-icons/hi";

type ModelProps = {
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  handleUpdate: (e: React.FormEvent<HTMLFormElement>) => void;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  editAccountData: {
    id: number;
    type: string;
    balance: number;
    title: string;
    createdAt: string;
  };
};

const Model: React.FC<ModelProps> = ({
  isEditing,
  setIsEditing,
  handleUpdate,
  handleChange,
  editAccountData,
}) => {

  if (!isEditing) return null;

  return (
    <div
      style={{ backgroundColor: "rgba(0, 172, 205, 0.35)" }}
      id="crud-modal"
      aria-hidden="true"
      className="overflow-y-auto overflow-x-hidden fixed z-50 flex justify-center items-center w-full md:inset-0 sm:inset-0 h-[calc(100%-1rem)] max-h-full"
    >
      <div className="relative p-4 w-full max-w-md max-h-full">
        <div className="relative bg-white rounded-lg shadow dark:">
          <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-800">
              Edit Account Form
            </h3>
            <button
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-400 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-400 dark:hover:text-white"
              data-modal-toggle="crud-modal"
              onClick={() => setIsEditing(false)}
            >
              <HiOutlineX className="text-2xl hover:bg-gray-2 hover:text-graydark" />
              <span className="sr-only">Close modal</span>
            </button>
          </div>
          <form className="p-4 md:p-5" onSubmit={handleUpdate}>
            <div className="grid gap-4 mb-4 grid-cols-2">
              <div className="col-span-2">
                <label
                  htmlFor="type"
                  className="block mb-2 text-sm font-medium text-graydark"
                >
                  Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={editAccountData.type}
                  onChange={handleChange}
                  className=" border border-gray text-graydark text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-200 dark:border-gray-500 dark:placeholder-gray-400 dark:focus:ring-primary-500 dark:focus:border-primary-500"
                >
                  <option>Saving</option>
                  <option>Checking</option>
                  <option>Business</option>
                </select>
              </div>
              <div className="col-span-2">
                <label
                  htmlFor="balance"
                  className="block mb-2 text-sm font-medium text-graydark"
                >
                  Balance
                </label>
                <input
                  type="number"
                  name="balance"
                  id="amount"
                  value={editAccountData.balance}
                  onChange={handleChange}
                  className=" border border-gray text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-200 dark:border-gray-500 dark:placeholder-gray-400 dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  placeholder=""
                  required
                />
              </div>

              <div className="col-span-2">
                <label
                  htmlFor="title"
                  className="block mb-2 text-sm font-medium text-graydark"
                >
                  Tilte
                </label>
                <input
                  id="title"
                  name="title"
                  value={editAccountData.title}
                  onChange={handleChange}
                  className="block p-2.5 w-full text-sm text-graydark  rounded-lg border border-gray focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-200 dark:border-gray-500 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder=""
                />
              </div>
              <div className="col-span-2">
                <label
                  htmlFor="date"
                  className="block mb-2 text-sm font-medium text-graydark"
                >
                  Date
                </label>
                <input
                  type="date"
                  name="createdAt"
                  id="date"
                  value={
                    new Date(editAccountData.createdAt).toLocaleDateString('en-CA')
                  }
                  onChange={handleChange}
                  className=" border border-gray text-graydark text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-200 dark:border-gray-500 dark:placeholder-gray-400 dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="text-white inline-flex items-center bg-[#00ABCD] hover:bg-[#3d9fb2] focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center"
            >
              Save
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Model;

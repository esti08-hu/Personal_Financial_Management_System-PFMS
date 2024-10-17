import { useState } from "react";
import { Form, message, Modal, Pagination, Select } from "antd";
import {
  HiOutlineArrowCircleUp,
  HiOutlinePencilAlt,
  HiOutlineTrash,
} from "react-icons/hi";
import type { User } from "@/app/types/user";
import apiClient from "@/app/lib/axiosConfig";

const TableThree: React.FC<{ users: User[]; fetchUsers: () => void }> = ({
  users,
  fetchUsers,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [isFormChanged, setIsFormChanged] = useState(false);
  const [initialValues, setInitialValues] = useState<{ role: string }>({
    role: "",
  });

  // Calculate the start and end index for slicing the users array
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedUsers = users.slice(startIndex, endIndex);

  const handleDelete = async (user: User) => {
    Modal.confirm({
      title: "Are you sure you want to delete this user?",
      content: "This action cannot be undone.",
      okText: "Yes, delete",
      okType: "danger",
      cancelText: "No, cancel",
      async onOk() {
        try {
          const response = await apiClient.delete(
            `/user/deleteUser${user.pid}`
          );
          if (response.status === 200) {
            message.success(`User ${user.name} deleted successfully`);
            fetchUsers();
          } else {
            message.error("Failed to delete user.");
          }
        } catch (error) {
          message.error("An error occurred while deleting the user.");
        }
      },
    });
  };

  const handleRestore = (user: User) => {
    Modal.confirm({
      title: "Are you sure you want to restore this user?",
      content: "This action cannot be undone.",
      okText: "Yes, restore",
      okType: "primary",
      cancelText: "No, cancel",
      okButtonProps:{style: {backgroundColor: "#00ABCD", color: "#fff", borderColor: "#00ABCD"}},
      async onOk() {
        try {
          const response = await apiClient.post(`/user/restore${user.pid}`);
          if (response.status === 201) {
            message.success(`User ${user.name} restored successfully`);
            fetchUsers();
          } else {
            message.error("Failed to restore user.");
          }
        } catch (error) {
          message.error("An error occurred while restoring the user.");
        }
      },
    });
  };

  const handleEdit = (user: User) => {
    setEditUser(user);
    const initialFormValues = { role: user.role };
    setInitialValues(initialFormValues);
    setEditModalVisible(true);
    form.setFieldsValue({
      role: user.role,
    });
    setIsFormChanged(false);
  };

  const handleEditSubmit = async (values: { role: string }) => {
    if (editUser) {
      try {
        const response = await apiClient.put(
          `/user/update-role${editUser.pid}`,
          {
            role: values.role,
          }
        );
        if (response.status === 200) {
          message.success(`User ${editUser.name}'s role updated successfully`);
          setEditModalVisible(false);
          fetchUsers();
        } else {
          message.error("Failed to update user role.");
        }
      } catch (error) {
        message.error("An error occurred while updating the user.");
      }
    }
    setIsFormChanged(false);
  };

  const handleValuesChange = () => {
    const currentValues = form.getFieldsValue();
    setIsFormChanged(
      JSON.stringify(currentValues) !== JSON.stringify(initialValues)
    );
  };

  const handlePageChange = (page: number, pageSize: number) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="max-w-full overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              <th className="min-w-[220px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                Name
              </th>
              <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                Email
              </th>
              <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                Status
              </th>
              <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                Role
              </th>
              <th className="px-4 py-4 font-medium text-black dark:text-white">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user) => (
              <tr key={user.pid} className="hover:bg-gray-100 dark:hover:bg-meta-4">
                <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                  <h5 className="font-medium text-black dark:text-white">
                    {user.name}
                  </h5>
                </td>
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <p className="text-black dark:text-white">{user.email}</p>
                </td>
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <p
                    className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${
                      !user.accountLockedUntil
                        ? "bg-success text-success"
                        : "bg-warning text-warning"
                    }`}
                  >
                    {!user.accountLockedUntil ? "Active" : "Locked"}
                  </p>
                </td>
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <p className="text-black dark:text-white">{user.role}</p>
                </td>
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <div className="flex items-center space-x-3.5">
                    {user.deletedAt ? (
                      // Render Restore Button for Deleted Users
                      <button
                        type="button"
                        onClick={() => handleRestore(user)}
                        className="flex items-center px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-md shadow-md hover:text-white transition duration-300 ease-in-out"
                      >
                        <HiOutlineArrowCircleUp className="text-xl mr-2" />
                        <span className="text-sm">Restore</span>
                      </button>
                    ) : (
                      <>
                        {/* Edit Button for non-deleted users */}
                        <button
                          type="button"
                          onClick={() => handleEdit(user)}
                          className="hover:text-[#00ABCD]"
                        >
                          <HiOutlinePencilAlt className="text-2xl" />
                        </button>
                        {/* Delete Button for non-deleted users */}
                        <button
                          type="button"
                          onClick={() => handleDelete(user)}
                          className="hover:text-danger"
                        >
                          <HiOutlineTrash className="text-2xl" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit User Modal */}
      <Modal
        open={editModalVisible}
        title="Edit User"
        onCancel={() => setEditModalVisible(false)}
        onOk={form.submit}
        className="!w-[400px]"
        okButtonProps={{
          disabled: !isFormChanged,
          style: {
            backgroundColor: isFormChanged ? "#00ABCD" : "#f5f5f5",
            color: isFormChanged ? "#fff" : "#d9d9d9",
            borderColor: isFormChanged ? "#00ABCD" : "#f5f5f5",
          },
        }}
        cancelButtonProps={{
          style: {
            borderColor: "#00ABCD",
            color: "#00ABCD",
          },
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleEditSubmit}
          onValuesChange={handleValuesChange}
        >
          <p>Promote User to Admin role.</p>
          <Form.Item label="Role" name="role" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="ADMIN">ADMIN</Select.Option>
              <Select.Option value="USER">USER</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Pagination Component */}
      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={users.length}
        onChange={handlePageChange}
        showSizeChanger
      />
    </div>
  );
};

export default TableThree;

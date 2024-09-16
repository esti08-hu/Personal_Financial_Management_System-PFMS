"use client";

import { useState } from "react";
import { Modal, Descriptions, Pagination } from "antd"; // Import Ant Design components
import { HiOutlinePencilAlt, HiOutlineTrash } from "react-icons/hi";
import type { User } from "@/types/package";

const TableThree: React.FC<{ users: User[] }> = ({ users }) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Calculate the start and end index for slicing the users array
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedUsers = users.slice(startIndex, endIndex);

  // Handle row click to open modal
  const handleRowClick = (user: User) => {
    setSelectedUser(user);
    setIsModalVisible(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedUser(null);
  };

  // Handle page change
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
            {paginatedUsers.map((user, key) => (
              <tr
                key={key}
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-meta-4"
                onClick={() => handleRowClick(user)}
              >
                <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                  <h5 className="font-medium text-black dark:text-white">{user.name}</h5>
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
                    <button className="hover:text-warning">
                      <HiOutlinePencilAlt className="text-2xl" />
                    </button>
                    <button className="hover:text-danger">
                      <HiOutlineTrash className="text-2xl" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Component */}
      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={users.length}
        onChange={handlePageChange}
        showSizeChanger
      />

      {/* Modal to show user details */}
      <Modal
        title="User Details"
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={null}
      >
        {selectedUser && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Name">{selectedUser.name}</Descriptions.Item>
            <Descriptions.Item label="Email">{selectedUser.email}</Descriptions.Item>
            <Descriptions.Item label="Status">
              {selectedUser.accountLockedUntil ? "Locked" : "Active"}
            </Descriptions.Item>
            <Descriptions.Item label="Email Confirmed">
              {selectedUser.isEmailConfirmed ? "Yes" : "No"}
            </Descriptions.Item>
            <Descriptions.Item label="Account Locked Until">
              {selectedUser.accountLockedUntil
                ? new Date(selectedUser.accountLockedUntil).toLocaleDateString()
                : "None"}
            </Descriptions.Item>
            <Descriptions.Item label="Created At">
              {new Date(selectedUser.date).toLocaleDateString()}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default TableThree;

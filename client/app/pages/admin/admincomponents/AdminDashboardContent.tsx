import React, { useEffect, useState } from "react";
import { Table, Tag, Spin, notification, Modal, Descriptions } from "antd";
import axios from "axios";
import "./styles/styles.css" // Optional: You can define custom styles for media queries here

const AdminDashboardContent = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
    const [selectedUser, setSelectedUser] = useState(null); // For storing selected user data
    const [isModalVisible, setIsModalVisible] = useState(false); // For controlling modal visibility
  
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:3001/users/users");
        setUsers(response.data.data); // Assuming API returns data in the 'data' field
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      fetchUsers();
    }, []);

  const columns = [
    // {
    //   title: "Name", // Combine firstName and lastName under the Name column
    //   key: "name",
    //   render: (text, record) => `${record.firstName} ${record.lastName}`, // Concatenate firstName and lastName
    // },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Status",
      dataIndex: "accountLockedUntil",
      key: "accountLockedUntil",
      render: (accountLockedUntil) => (
        <Tag color={!accountLockedUntil? "green" : "red"}>
          {!accountLockedUntil ? "Active" : "Locked"}
        </Tag>
      ),
    },
    {
      title: "Email Confirmed",
      dataIndex: "isEmailConfirmed",
      key: "isEmailConfirmed",
      render: (isEmailConfirmed) => (
        <Tag color={isEmailConfirmed ? "blue" : "volcano"}>
          {isEmailConfirmed ? "Confirmed" : "Not Confirmed"}
        </Tag>
      ),
    },
    {
      title: "Registered With Google",
      dataIndex: "isRegisteredWithGoogle",
      key: "isEmailConfirmed",
      render: (isRegisteredWithGoogle) => (
        <Tag color={isRegisteredWithGoogle ? "blue" : "volcano"}>
          {isRegisteredWithGoogle ? "Yes" : "No"}
        </Tag>
      ),
    },
    {
      title: "Account Locked Until",
      dataIndex: "accountLockedUntil",
      key: "accountLockedUntil",
      render: (date) => (date ? new Date(date).toLocaleDateString() : "None"),
    },
    // {
    //   title: "Created At",
    //   dataIndex: "date",
    //   key: "date",
    //   render: (date) => new Date(date).toLocaleDateString(),
    // },
  ];

// Function to handle row clicks
const handleRowClick = (record) => {
  setSelectedUser(record); // Set the clicked user as the selected user
  setIsModalVisible(true); // Open the modal
};

// Function to close modal
const handleCloseModal = () => {
  setIsModalVisible(false);
  setSelectedUser(null); // Clear selected user after closing modal
};

return (
  <div style={{ padding: "20px" }}>
    <h1>User Management</h1>
    {loading ? (
      <Spin />
    ) : (
      <Table
        columns={columns}
        dataSource={users}
        rowKey={(record) => record.id}
        onRow={(record) => ({
          onClick: () => handleRowClick(record), // Handle row click
        })}
      />
    )}

    {/* Modal for showing user details */}
    <Modal
      title="User Details"
      open={isModalVisible}
      onCancel={handleCloseModal}
      footer={null} // No footer (i.e., no OK/Cancel buttons)
    >
      {selectedUser && (
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Name">
          {`${selectedUser.name}`}
          {/* {`${selectedUser.firstName} ${selectedUser.lastName}`} */}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {selectedUser.email}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            {selectedUser.status === "active" ? "Active" : "Inactive"}
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

export default AdminDashboardContent;

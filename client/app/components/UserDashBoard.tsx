"use client";

import { useState, useEffect, useReducer } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Button,
  Switch,
  Spin,
  Layout,
  Menu,
  Avatar,
  Modal,
  Input,
  Form,
} from "antd";
import {
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SecurityScanOutlined,
  BellOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import apiClient from "../lib/axiosConfig";

const { Header, Sider, Content } = Layout;

// Reducer function for handling complex state
const initialState = {
  user: { name: "", email: "", profilePicture: "" },
  isLoading: true,
  activeTab: "profile",
  isSidebarOpen: true,
  isChangePasswordModalVisible: false, // Added state for password change modal visibility
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload, isLoading: false };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ACTIVE_TAB":
      return { ...state, activeTab: action.payload };
    case "TOGGLE_SIDEBAR":
      return { ...state, isSidebarOpen: !state.isSidebarOpen };
    case "TOGGLE_CHANGE_PASSWORD_MODAL":
      return {
        ...state,
        isChangePasswordModalVisible: !state.isChangePasswordModalVisible,
      };
    default:
      return state;
  }
}

const Dashboard = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    user,
    isLoading,
    activeTab,
    isSidebarOpen,
    isChangePasswordModalVisible,
  } = state;
  const router = useRouter();
  const [isTokenRefreshing, setIsTokenRefreshing] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await apiClient.get("/auth/user-profile");
        dispatch({
          type: "SET_USER",
          payload: {
            name: response.data.name,
            email: response.data.email,
            profilePicture: response.data.profilePicture,
            pid: response.data.pid,
          },
        });
      } catch (err) {
        // Check if the error is due to an expired token
        if (err.response?.status === 401 && !isTokenRefreshing) {
          setIsTokenRefreshing(true);
          await refreshTokenAndRetry(fetchUserData);
        } else {
          toast.error(
            "An error occurred while fetching user data. Please try again."
          );
          setTimeout(() => router.push("/login"), 2000);
        }
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    fetchUserData();
  }, []);

  const refreshTokenAndRetry = async (callback) => {
    try {
      // Assuming apiClient will handle token refresh automatically
      await apiClient.get("/auth/refresh"); // Trigger the token refresh
      await callback(); // Retry the original request
    } catch (error) {
      console.error("Error refreshing token:", error);
      toast.error("Could not refresh access token. Please login again.");
      router.push("/login");
    } finally {
      setIsTokenRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center w-full h-screen">
        <Spin size="large" />
      </div>
    );
  }

  const handleChangePassword = async (values) => {
    const { pid } = state.user;
    const { currentPassword, newPassword } = values;

    try {
      if (currentPassword === newPassword) {
        toast.error("New password cannot be the same as the current password.");
        return;
      }

      const response = await apiClient.patch("/password/updateUser", {
        pid,
        currentPassword,
        newPassword,
      });

      if (response.status === 200) {
        toast.success("Password changed successfully!");
      } else {
        toast.error("Failed to change password.");
      }
    } catch (error) {
      console.error("Error changing password:", error); // Log the error for debugging
      toast.error("An error occurred. Please try again.");
    }

    toggleChangePasswordModal();
  };

  const handleLogout = async () => {
    try {
      const response = await apiClient.post("/auth/logout");
      if (response.status === 200) {
        toast.success("Logout successful!");
        setTimeout(() => router.push("/login"), 2000);
      }
    } catch (err) {
      toast.error("An error occurred during logout. Please try again.");
    }
  };

  const toggleSidebar = () => {
    dispatch({ type: "TOGGLE_SIDEBAR" });
  };

  const toggleChangePasswordModal = () => {
    dispatch({ type: "TOGGLE_CHANGE_PASSWORD_MODAL" });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center w-full h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Layout className="h-screen">
      {/* Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={!isSidebarOpen}
        className="neumorphic"
      >
        <div className="flex items-center justify-between p-4">
          {/* Profile Picture */}
          <Avatar
            size={64}
            src={user.profilePicture || "/user.png"}
            alt="Profile"
          />
          {/* Toggle Button */}
          <Button type="primary" onClick={toggleSidebar}>
            {isSidebarOpen ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
          </Button>
        </div>

        <Menu theme="dark" mode="inline" selectedKeys={[activeTab]}>
          <Menu.Item
            key="profile"
            icon={<UserOutlined />}
            onClick={() =>
              dispatch({ type: "SET_ACTIVE_TAB", payload: "profile" })
            }
          >
            Profile
          </Menu.Item>
          <Menu.Item
            key="settings"
            icon={<SettingOutlined />}
            onClick={() =>
              dispatch({ type: "SET_ACTIVE_TAB", payload: "settings" })
            }
          >
            Settings
          </Menu.Item>
          <Menu.Item
            key="notifications"
            icon={<BellOutlined />}
            onClick={() =>
              dispatch({ type: "SET_ACTIVE_TAB", payload: "notifications" })
            }
          >
            Notifications
          </Menu.Item>
          <Menu.Item
            key="security"
            icon={<SecurityScanOutlined />}
            onClick={() =>
              dispatch({ type: "SET_ACTIVE_TAB", payload: "security" })
            }
          >
            Security
          </Menu.Item>
          <Menu.Item
            key="about"
            icon={<InfoCircleOutlined />}
            onClick={() =>
              dispatch({ type: "SET_ACTIVE_TAB", payload: "about" })
            }
          >
            About
          </Menu.Item>
          <Menu.Item
            key="logout"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
          >
            Logout
          </Menu.Item>
        </Menu>
      </Sider>

      {/* Main Content */}
      <Layout>
        <Content className="p-8">
          <AnimatePresence mode="wait">
            {activeTab === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white neumorphic rounded-3xl p-8"
              >
                <h1 className="text-3xl font-bold mb-6">
                  Welcome, {user.name}!
                </h1>
                <p className="text-lg mb-4">
                  This is your personalized dashboard. Here you can view and
                  manage your profile information.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <h3 className="font-bold mb-2">Email</h3>
                    <p>{user.email}</p>
                  </div>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <h3 className="font-bold mb-2">Account Status</h3>
                    <p>Active</p>
                  </div>
                </div>
              </motion.div>
            )}
            {activeTab === "settings" && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white neumorphic rounded-3xl p-8"
              >
                <h1 className="text-3xl font-bold mb-6">Settings</h1>
                <p className="text-lg mb-4">
                  Manage your account settings and preferences here.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block mb-2 font-bold">Theme</label>
                    <Switch
                      defaultChecked
                      onChange={(checked) =>
                        console.log(`switch to ${checked}`)
                      }
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-bold">
                      Notifications
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      Receive email notifications
                    </label>
                  </div>
                  <div>
                    <Button
                      type="primary"
                      className="w-full"
                      onClick={toggleChangePasswordModal}
                    >
                      Change Password
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
            {activeTab === "notifications" && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white neumorphic rounded-3xl p-8"
              >
                <h1 className="text-3xl font-bold mb-6">Notifications</h1>
                <p className="text-lg mb-4">
                  Manage your notification preferences.
                </p>
                {/* Notification preferences content */}
              </motion.div>
            )}
            {activeTab === "security" && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white neumorphic rounded-3xl p-8"
              >
                <h1 className="text-3xl font-bold mb-6">Security</h1>
                <p className="text-lg mb-4">
                  Review and update your security settings.
                </p>
                {/* Security settings content */}
              </motion.div>
            )}
            {activeTab === "about" && (
              <motion.div
                key="about"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white neumorphic rounded-3xl p-8"
              >
                <h1 className="text-3xl font-bold mb-6">About</h1>
                <p className="text-lg mb-4">
                  Learn more about this application and its features.
                </p>
                {/* About content */}
              </motion.div>
            )}
          </AnimatePresence>
        </Content>
      </Layout>

      {/* Password Change Modal */}
      <Modal
        title="Change Password"
        visible={isChangePasswordModalVisible}
        onCancel={toggleChangePasswordModal}
        footer={null}
      >
        <Form layout="vertical" onFinish={handleChangePassword}>
          <Form.Item
            label="Current Password"
            name="currentPassword"
            rules={[
              {
                required: true,
                message: "Please input your current password!",
              },
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            label="New Password"
            name="newPassword"
            rules={[
              { required: true, message: "Please input your new password!" },
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
            <Button
              type="default"
              onClick={toggleChangePasswordModal}
              className="ml-2"
            >
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
      />
    </Layout>
  );
};

export default Dashboard;

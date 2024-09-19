"use client";

import { useState, useEffect, useReducer } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button, Switch, Spin, Layout, Menu, Avatar } from "antd";
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
import "../styles/style.css";
import ChangePasswordModal from "./ChangePassword";
import { ConfigProvider, theme } from "antd";
import Loader from "./admin components/common/Loader";

const { Header, Sider, Content } = Layout;

// Reducer function for handling complex state
const initialState = {
  user: { name: "", email: "", profilePicture: "" },
  isLoading: true,
  activeTab: "profile",
  isSidebarOpen: true,
  isChangePasswordModalVisible: false, // Added state for password change modal visibility
};

function reducer(state: State, action: Action) {
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
  const [registeredWithGoogle, setRegisteredWithGoogle] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const savedDarkMode = localStorage.getItem("isDarkMode");
      return savedDarkMode ? JSON.parse(savedDarkMode) : false;
    }
    return false; // Default to light mode if no value in localStorage
  });

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
        setRegisteredWithGoogle(response.data.isRegisteredWithGoogle);
      } catch (err) {
        if (err.response?.status === 401 && !isTokenRefreshing) {
          setIsTokenRefreshing(true);
          await refreshTokenAndRetry(fetchUserData);
        } else {
          toast.error(
            "An error occurred while fetching user data. Please try again."
          );
          setTimeout(() => router.push("/pages/login"), 2000);
        }
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    fetchUserData();
  }, [isTokenRefreshing, router]);

  const refreshTokenAndRetry = async (callback: () => Promise<void>) => {
    try {
      await apiClient.get("/auth/refresh");
      await callback();
    } catch (error) {
      toast.error("Could not refresh access token. Please login again.");
      router.push("/pages/login");
    } finally {
      setIsTokenRefreshing(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("isDarkMode", JSON.stringify(isDarkMode));
    }
  }, [isDarkMode]);

  const handleChangePassword = async (values) => {
    const { pid } = state.user;
    if (!pid) {
      toast.error("User PID is missing.");
      return;
    }

    try {
      const response = await apiClient.patch("/password/updateUser", {
        pid,
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      if (response.status === 200) {
        toast.success("Password changed successfully!");
        toggleChangePasswordModal();
      } else {
        toast.error("Failed to change password.");
      }
    } catch (err) {
      toast.error(err.response.data.message);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await apiClient.post("/auth/logout");
      if (response.status === 200) {
        toast.success("Logout successful!");
        setTimeout(() => router.push("/pages/login"), 2000);
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
        <Loader />
      </div>
    );
  }

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorBgContainer: isDarkMode ? "#2e3440" : "#ffffff",
          colorText: isDarkMode ? "#ffffff" : "#000000",
          colorPrimary: isDarkMode ? "#2dc6e5" : "#00ABCD",
          // Add other custom tokens as needed
        },
      }}
    >
      <Layout
        className={`h-screen custom-layout ${
          isDarkMode ? "dark-mode" : "light-mode"
        }`}
      >
        {/* Sidebar */}
        <Sider
          trigger={null}
          collapsible
          collapsed={!isSidebarOpen}
          className={`neumorphic ${
            isDarkMode ? "dark-sidebar" : "light-sidebar"
          }`}
        >
          <div className="flex items-center justify-between p-4">
            <Avatar
              size={64}
              src={user.profilePicture || "/user.png"}
              alt="Profile"
            />
            <Button
              className="hover:!border-[#00ABCD]"
              ghost
              onClick={toggleSidebar}
            >
              {isSidebarOpen ? (
                <MenuFoldOutlined className="hover:text-[#00ABCD]" />
              ) : (
                <MenuUnfoldOutlined />
              )}
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
          <Content
            className={`p-8 ${isDarkMode ? "dark-content" : "light-content"}`} // Add class for content area
          >
            <AnimatePresence mode="wait">
              {activeTab === "profile" && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`neumorphic rounded-3xl p-8 ${
                    isDarkMode ? "dark-card" : "light-card"
                  }`} // Conditional class for dark mode
                >
                  <h1 className="text-3xl font-bold mb-6">
                    Welcome, {user.name}!
                  </h1>
                  <p className="text-lg mb-4">
                    This is your personalized dashboard. Here you can view and
                    manage your profile information.
                  </p>
                </motion.div>
              )}
              {activeTab === "settings" && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`neumorphic rounded-3xl p-8 ${
                    isDarkMode ? "dark-card" : "light-card"
                  }`} // Conditional class for dark mode
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
                        checked={isDarkMode}
                        className="custom-switch"
                        onChange={(checked) => setIsDarkMode(checked)}
                      />
                    </div>
                    <div>
                      <label className="block mb-2 font-bold">
                        Notifications
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="custom-checkbox mr-2"
                        />
                        Receive email notifications
                      </label>
                    </div>
                    {!registeredWithGoogle && (
                      <div>
                        <Button
                          type="primary"
                          className="w-1/2 bg-[#00ABCD] hover:!bg-[#2dc6e5]"
                          onClick={toggleChangePasswordModal}
                        >
                          Change Password
                        </Button>
                      </div>
                    )}
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
                  className={`neumorphic rounded-3xl p-8 ${
                    isDarkMode ? "dark-card" : "light-card"
                  }`} // Conditional class for dark mode
                >
                  <h1 className="text-3xl font-bold mb-6">Notifications</h1>
                  <p className="text-lg mb-4">
                    Manage your notification preferences.
                  </p>
                </motion.div>
              )}
              {activeTab === "security" && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`neumorphic rounded-3xl p-8 ${
                    isDarkMode ? "dark-card" : "light-card"
                  }`} // Conditional class for dark mode
                >
                  <h1 className="text-3xl font-bold mb-6">Security</h1>
                  <p className="text-lg mb-4">
                    Review and update your security settings.
                  </p>
                </motion.div>
              )}
              {activeTab === "about" && (
                <motion.div
                  key="about"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`neumorphic rounded-3xl p-8 ${
                    isDarkMode ? "dark-card" : "light-card"
                  }`} // Conditional class for dark mode
                >
                  <h1 className="text-3xl font-bold mb-6">About</h1>
                  <p className="text-lg mb-4">
                    Learn more about this application and its features.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </Content>
        </Layout>

        <ChangePasswordModal
          isVisible={isChangePasswordModalVisible}
          toggleModal={toggleChangePasswordModal}
          handleChangePassword={handleChangePassword}
        />

        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
        />
      </Layout>
    </ConfigProvider>
  );
};

export default Dashboard;

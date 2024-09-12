"use client";

import { useState, useEffect, useReducer } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button, Spin, Layout, Menu, Avatar } from "antd";
import {
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import apiClient from "@/app/lib/axiosConfig";
import AdminDashboardContent from "./AdminDashboardContent"; // Replace with your actual content components
import { ConfigProvider, theme } from "antd";
import SettingsContent from "./SettingsContent";
import "./styles/styles.css";

const { Header, Sider, Content } = Layout;

// Initial state for the reducer
const initialState = {
  user: { name: "", email: "", profilePicture: "" },
  isLoading: true,
  activeTab: "dashboard", // Default tab
  isSidebarOpen: true,
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
    default:
      return state;
  }
}

const AdminDashboard = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { user, isLoading, activeTab, isSidebarOpen } = state;
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const savedDarkMode = localStorage.getItem("isDarkMode");
      return savedDarkMode ? JSON.parse(savedDarkMode) : false;
    }
    return false;
  });

  // Fetch admin data on component load
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await apiClient.get("/auth/admin-profile");
        dispatch({
          type: "SET_USER",
          payload: {
            name: response.data.name,
            email: response.data.email,
            profilePicture: response.data.profilePicture,
          },
        });
      } catch (error) {
        toast.error("An error occurred while fetching user data.");
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    fetchAdminData();
  }, []);

  // Persist dark mode state in localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("isDarkMode", JSON.stringify(isDarkMode));
    }
  }, [isDarkMode]);

  const handleLogout = async () => {
    try {
      const response = await apiClient.post("/auth/logout");
      if (response.status === 200) {
        toast.success("Logout successful!");
        setTimeout(() => router.push("/admin/signin"), 2000);
      }
    } catch (err) {
      toast.error("An error occurred during logout.");
    }
  };

  const toggleSidebar = () => {
    dispatch({ type: "TOGGLE_SIDEBAR" });
  };

  const handleTabChange = (key) => {
    dispatch({ type: "SET_ACTIVE_TAB", payload: key });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center w-full h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <Layout className={`h-screen ${isDarkMode ? "dark-mode" : "light-mode"}`}>
        {/* Sidebar */}
        <Sider collapsible collapsed={!isSidebarOpen} trigger={null}>
          <div className="flex items-center justify-between p-4">
            <Avatar
              size={64}
              src={user.profilePicture || "/user.png"}
              alt="Profile"
            />
            <Button ghost onClick={toggleSidebar}>
              {isSidebarOpen ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
            </Button>
          </div>

          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[activeTab]}
            onClick={({ key }) => handleTabChange(key)}
          >
            <Menu.Item key="dashboard" icon={<UserOutlined />}>
              Dashboard
            </Menu.Item>
            <Menu.Item key="settings" icon={<SettingOutlined />}>
              Settings
            </Menu.Item>
            <Menu.Item key="notifications" icon={<BellOutlined />}>
              Notifications
            </Menu.Item>
            <Menu.Item key="about" icon={<InfoCircleOutlined />}>
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
        <Layout className="site-layout">
          <Content
            className={`p-8 ${isDarkMode ? "dark-content" : "light-content"}`}
          >
            <AnimatePresence>
              {activeTab === "dashboard" && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <AdminDashboardContent />
                </motion.div>
              )}
              {activeTab === "settings" && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <SettingsContent />
                </motion.div>
              )}
              {/* Add other tabs here as needed */}
            </AnimatePresence>
          </Content>
        </Layout>
      </Layout>

      {/* Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        pauseOnFocusLoss
      />
    </ConfigProvider>
  );
};

export default AdminDashboard;

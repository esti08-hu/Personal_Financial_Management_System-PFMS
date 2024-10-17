"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "../../../common/Breadcrumbs/Breadcrumb";
import TableThree from "../../../components/admin components/Tables/TableThree";
import DefaultLayout from "../../../components/admin components/Layouts/DefaultLayout";
import apiClient from "@/app/lib/axiosConfig";
import { Select } from "antd";

const TablesPage = () => {
  const [users, setUsers] = useState([]);


  const [filter, setFilter] = useState("all");

  const fetchUsers = async (endpoint: string) => {
    try {
      const response = await apiClient.get(endpoint);
      setUsers(response.data.data);
    } catch (error) {
      console.error(`Error fetching ${filter} users:`, error);
    }
  };

  useEffect(() => {
    switch (filter) {
      case "locked":
        fetchUsers("/user/locked");
        break;
      case "unverified":
        fetchUsers("/user/unverified");
        break;
      case "deleted":
        fetchUsers("/user/deleted-accounts");
        break;
      default:
        fetchUsers("/user/users");
    }
  }, [filter]);

  const handleFilterChange = (value: string) => {
    setFilter(value);
  };


  return (
    <DefaultLayout>
      <Breadcrumb pageName="Users" />
      <div className="flex flex-col gap-8">
        <Select className="max-w-35"  defaultValue="all" onChange={handleFilterChange}>
          <Select.Option value="all">All Users</Select.Option>
          <Select.Option value="locked">Locked Users</Select.Option>
          <Select.Option value="unverified">Unverified Users</Select.Option>
          <Select.Option value="deleted">Deleted Users</Select.Option>
        </Select>
        <TableThree users={users} fetchUsers={() => fetchUsers("/user/users")} />
      </div>
    </DefaultLayout>
  );
};

export default TablesPage;

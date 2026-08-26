"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "../../../common/Breadcrumbs/Breadcrumb";
import TableThree from "../../../components/admin components/Tables/TableThree";
import apiClient from "@/app/lib/axiosConfig";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  return (
    <>
      <Breadcrumb pageName="Users" />
      <div className="flex flex-col gap-8">
        <div className="w-[200px]">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Select filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="locked">Locked Users</SelectItem>
              <SelectItem value="unverified">Unverified Users</SelectItem>
              <SelectItem value="deleted">Deleted Users</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <TableThree users={users} fetchUsers={() => fetchUsers("/user/users")} />
      </div>
    </>
  );
};

export default TablesPage;

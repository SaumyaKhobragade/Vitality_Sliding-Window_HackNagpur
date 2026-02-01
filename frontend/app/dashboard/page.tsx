"use client";

import DashboardStats from "../Components/Common/DashboardStats";
import PatientFlowChart from "../Components/Charts/PatientFlowChart";
import OperationsAlerts from "../Components/alerts/OperationsAlerts";
import HospitalStatusList from "../Components/alerts/HospitalStatusList";
import { Filter, ArrowUpDown } from "lucide-react";
import { useAuth } from "@/app/Context/AuthContext";
const DashboardPage = () => {
  const { user } = useAuth();
  return (
    <div className="bg-background-light dark:bg-background-dark font-body text-text-light dark:text-text-dark antialiased transition-colors duration-200">
      <main className="flex-1 overflow-y-auto p-6 bg-background-light dark:bg-background-dark transition-colors duration-200">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Good morning, {user?.name || "Guest User"}!
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Here is the latest status for Metropolis healthcare network.
          </p>
        </div>

        <DashboardStats />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <PatientFlowChart />
          <OperationsAlerts />
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Hospital Status
          </h2>
          <div className="flex gap-2">
            <button className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
              <Filter className="h-4 w-4" />
              Filter
            </button>
            <button className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
              <ArrowUpDown className="h-4 w-4" />
              Sort
            </button>
          </div>
        </div>

        <HospitalStatusList />

        <div className="h-10"></div>
      </main>
    </div>
  );
};

export default DashboardPage;

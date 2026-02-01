"use client";

import React from "react";
import { DashboardNavBar } from "../../Components/Navigation/DashboardNavBar";
import RedirectionMonitor from "../../Components/Common/RedirectionMonitor";

const DecisionMonitorPage = () => {
  return (
    <div className="bg-background-light dark:bg-background-dark font-body text-text-light dark:text-text-dark antialiased transition-colors duration-200 h-screen flex flex-col">
      <DashboardNavBar />
      <main className="flex-1 overflow-y-auto p-6 bg-background-light dark:bg-background-dark transition-colors duration-200">
        <div className="max-w-7xl mx-auto space-y-6">
          <RedirectionMonitor />
        </div>
      </main>
    </div>
  );
};

export default DecisionMonitorPage;

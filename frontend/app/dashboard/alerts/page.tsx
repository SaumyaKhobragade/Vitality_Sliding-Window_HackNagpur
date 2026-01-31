import React from "react";
import {
  Filter,
  TriangleAlert,
  ChevronRight,
  Stethoscope,
  Clock,
  BarChart2,
  MapPin,
  Users,
  ArrowRight,
  Info,
  VideoOff,
  CheckCircle,
  X,
  AlertTriangle,
} from "lucide-react";
import Image from "next/image";

const page = () => {
  return (
    <div className="bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark transition-colors duration-200 h-full flex flex-col">
      <main className="flex-1 flex overflow-hidden">
        <section className="w-2/5 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-gray-50 dark:bg-[#0f172a]">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700 bg-card-light dark:bg-card-dark flex justify-between items-center shrink-0">
            <h2 className="font-semibold text-lg flex items-center">
              Active Distress Alerts
              <span className="ml-2 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-200 text-xs font-bold px-2 py-0.5 rounded-full">
                4
              </span>
            </h2>
            <button className="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary transition-colors">
              <Filter className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-custom p-4 space-y-3">
            <div className="cursor-pointer group relative bg-card-light dark:bg-card-dark p-4 rounded-lg shadow-sm border-2 border-primary ring-1 ring-primary/20 dark:ring-primary/10 transition-all">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-mono text-xs text-text-secondary-light dark:text-text-secondary-dark">
                    ID: #8X92-KLM
                  </span>
                  <h3 className="font-bold text-sm mt-0.5 text-text-primary-light dark:text-text-primary-dark">
                    St. Mary&apos;s General
                  </h3>
                </div>
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border border-red-200 dark:border-red-800">
                  <TriangleAlert className="h-4 w-4 mr-1" />
                  COLLAPSE
                </span>
              </div>
              <div className="flex items-center justify-between mt-3 text-sm">
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark font-semibold">
                      Confidence
                    </span>
                    <span className="font-bold text-green-600 dark:text-green-400">
                      98%
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark font-semibold">
                      Wait Time
                    </span>
                    <span className="font-medium">12m</span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="cursor-pointer group relative bg-card-light dark:bg-card-dark p-4 rounded-lg shadow-sm border border-transparent hover:border-gray-300 dark:hover:border-gray-600 transition-all hover:shadow-md">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-mono text-xs text-text-secondary-light dark:text-text-secondary-dark">
                    ID: #3B77-QWR
                  </span>
                  <h3 className="font-bold text-sm mt-0.5 text-text-primary-light dark:text-text-primary-dark">
                    City Central Hospital
                  </h3>
                </div>
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  AGITATION
                </span>
              </div>
              <div className="flex items-center justify-between mt-3 text-sm">
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark font-semibold">
                      Confidence
                    </span>
                    <span className="font-bold text-yellow-600 dark:text-yellow-400">
                      76%
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark font-semibold">
                      Wait Time
                    </span>
                    <span className="font-medium">45m</span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-300 dark:text-gray-600 group-hover:text-primary transition-colors" />
              </div>
            </div>
            <div className="cursor-pointer group relative bg-card-light dark:bg-card-dark p-4 rounded-lg shadow-sm border border-transparent hover:border-gray-300 dark:hover:border-gray-600 transition-all hover:shadow-md">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-mono text-xs text-text-secondary-light dark:text-text-secondary-dark">
                    ID: #9LOP-11X
                  </span>
                  <h3 className="font-bold text-sm mt-0.5 text-text-primary-light dark:text-text-primary-dark">
                    Westside Clinic
                  </h3>
                </div>
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border border-red-200 dark:border-red-800">
                  <Stethoscope className="h-4 w-4 mr-1" />
                  SEIZURE
                </span>
              </div>
              <div className="flex items-center justify-between mt-3 text-sm">
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark font-semibold">
                      Confidence
                    </span>
                    <span className="font-bold text-green-600 dark:text-green-400">
                      92%
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark font-semibold">
                      Wait Time
                    </span>
                    <span className="font-medium">08m</span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-300 dark:text-gray-600 group-hover:text-primary transition-colors" />
              </div>
            </div>
            <div className="cursor-pointer group relative bg-card-light dark:bg-card-dark p-4 rounded-lg shadow-sm border border-transparent hover:border-gray-300 dark:hover:border-gray-600 transition-all hover:shadow-md opacity-60">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-mono text-xs text-text-secondary-light dark:text-text-secondary-dark">
                    ID: #22KK-MM9
                  </span>
                  <h3 className="font-bold text-sm mt-0.5 text-text-primary-light dark:text-text-primary-dark">
                    St. Mary&apos;s General
                  </h3>
                </div>
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                  <Clock className="h-4 w-4 mr-1" />
                  PROLONGED
                </span>
              </div>
              <div className="flex items-center justify-between mt-3 text-sm">
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark font-semibold">
                      Confidence
                    </span>
                    <span className="font-bold text-gray-600 dark:text-gray-400">
                      --
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark font-semibold">
                      Wait Time
                    </span>
                    <span className="font-medium text-red-500">4h 12m</span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-300 dark:text-gray-600 group-hover:text-primary transition-colors" />
              </div>
            </div>
          </div>
        </section>
        <section className="w-3/5 bg-background-light dark:bg-background-dark flex flex-col h-full overflow-y-auto">
          <div className="p-8 max-w-4xl mx-auto w-full">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center space-x-3 mb-1">
                  <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
                    Alert Details
                  </h2>
                  <span className="px-2 py-0.5 rounded text-xs font-mono bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                    #8X92-KLM
                  </span>
                </div>
                <p className="text-text-secondary-light dark:text-text-secondary-dark">
                  St. Mary&apos;s General Hospital • Triage Sector 4
                </p>
              </div>
              <div className="flex flex-col items-end">
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border border-red-200 dark:border-red-800 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-red-600 mr-2 animate-pulse"></span>
                  POTENTIAL COLLAPSE
                </span>
                <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-2">
                  Detected 2 mins ago
                </span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-card-light dark:bg-card-dark p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2 mb-2 text-text-secondary-light dark:text-text-secondary-dark">
                  <BarChart2 className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    Confidence
                  </span>
                </div>
                <div className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
                  98%
                  <span className="text-xs font-normal text-green-500 ml-1">
                    High
                  </span>
                </div>
              </div>
              <div className="bg-card-light dark:bg-card-dark p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2 mb-2 text-text-secondary-light dark:text-text-secondary-dark">
                  <MapPin className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    Location
                  </span>
                </div>
                <div className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark truncate">
                  Waiting Area B
                </div>
                <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">
                  Camera Feed 04
                </div>
              </div>
              <div className="bg-card-light dark:bg-card-dark p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2 mb-2 text-text-secondary-light dark:text-text-secondary-dark">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    Detection Time
                  </span>
                </div>
                <div className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">
                  10:42:15 AM
                </div>
                <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">
                  Today
                </div>
              </div>
            </div>
            <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <h3 className="font-semibold text-lg mb-4 text-text-primary-light dark:text-text-primary-dark flex items-center">
                <Users className="mr-2 h-5 w-5 text-primary" />
                Queue Context
              </h3>
              <div className="flex items-center justify-between">
                <div className="flex-1 pr-8">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
                      Estimated Severity
                    </span>
                    <span className="text-lg font-bold text-red-500">8/10</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div
                      className="bg-red-500 h-2.5 rounded-full"
                      style={{ width: "80%" }}
                    ></div>
                  </div>
                  <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-2">
                    Patient exhibited sudden loss of posture consistent with
                    fainting.
                  </p>
                </div>
                <div className="w-px h-16 bg-gray-200 dark:bg-gray-700 mx-4"></div>
                <div className="flex-1 pl-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg text-center min-w-[60px]">
                      <span className="block text-xs text-text-secondary-light dark:text-text-secondary-dark uppercase">
                        Was
                      </span>
                      <span className="block font-bold text-lg">#14</span>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                    <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-lg text-center min-w-[60px] border border-red-200 dark:border-red-800">
                      <span className="block text-xs text-red-600 dark:text-red-400 uppercase font-bold">
                        Now
                      </span>
                      <span className="block font-bold text-lg text-red-600 dark:text-red-400">
                        #1
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-2">
                    System recommends immediate priority escalation.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-primary p-4 mb-6 rounded-r-lg flex items-start">
              <Info className="text-primary mr-3 mt-0.5 h-5 w-5" />
              <div>
                <h4 className="font-bold text-primary dark:text-blue-400 text-sm uppercase tracking-wide">
                  Recommended Action
                </h4>
                <p className="text-text-primary-light dark:text-text-primary-dark mt-1">
                  Immediate staff intervention required in
                  <span className="font-semibold">Zone B</span>. Check vital
                  signs and secure the patient.
                </p>
              </div>
            </div>
            <div className="mb-6">
              <h3 className="font-semibold text-sm text-text-secondary-light dark:text-text-secondary-dark mb-3 uppercase tracking-wider">
                Detection Snapshot
              </h3>
              <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden relative border border-gray-300 dark:border-gray-600 flex items-center justify-center group">
                <div className="absolute inset-0 bg-linear-to-br from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-800 opacity-50"></div>
                <VideoOff className="h-12 w-12 text-gray-400 dark:text-gray-500 z-10" />
                <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm font-mono">
                  CAM-04 • LIVE
                </div>
                <div className="absolute inset-0 border-4 border-red-500/50 rounded-lg m-12 pointer-events-none"></div>
                <div className="absolute top-16 right-16 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                  98%
                </div>
              </div>
            </div>
            <div className="bg-card-light dark:bg-card-dark p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-lg mb-4 text-text-primary-light dark:text-text-primary-dark">
                Triage Decision
              </h3>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1"
                  htmlFor="reasoning"
                >
                  Reasoning / Notes <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:text-white sm:text-sm"
                  id="reasoning"
                  placeholder="e.g. Verified via CCTV, security dispatched..."
                  rows={3}
                ></textarea>
              </div>
              <div className="flex items-center space-x-4 pt-2">
                <button className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-4 rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary flex justify-center items-center">
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Confirm Alert
                </button>
                <button className="flex-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 font-bold py-2.5 px-4 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex justify-center items-center">
                  <X className="mr-2 h-5 w-5" />
                  Dismiss / False Alarm
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default page;

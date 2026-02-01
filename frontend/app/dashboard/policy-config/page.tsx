"use client";

import React, { useState, useEffect } from "react";
import {
  Info,
  AlertTriangle,
  Check,
  Plus,
  Activity,
  ShieldAlert,
  RotateCcw,
  Save,
  Circle,
} from "lucide-react";
import { CustomSlider } from "@/components/ui/custom-slider";
import { CustomSwitch } from "@/components/ui/custom-switch";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/app/Components/dashboard/ConfirmationDialog";
import { LoadingDialog } from "@/app/Components/dashboard/LoadingDialog";
import { SuccessToast } from "@/app/Components/dashboard/SuccessToast";
import { AlertBanner } from "@/app/Components/dashboard/AlertBanner";

import * as ApiClient from "@/lib/api-client";
import { Policy, TriagePolicy } from "@/lib/types";

const PolicyConfig = () => {
  // State for configuration
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null);
  
  // New Triage Policies (HITL)
  const [triagePolicies, setTriagePolicies] = useState<TriagePolicy[]>([]);
  
  // Form State
  const [severityWeight, setSeverityWeight] = useState(0.85);
  const [agingRate, setAgingRate] = useState(15); // Minutes
  const [enableAging, setEnableAging] = useState(true);
  const [distressDecay, setDistressDecay] = useState(0.5);

  // HITL Form State
  const [provisionalBoost, setProvisionalBoost] = useState(50);
  const [confirmedBoost, setConfirmedBoost] = useState(100);
  const [timeout, setTimeoutDuration] = useState(120);

  // State for dialogs and toasts
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showLoadingDialog, setShowLoadingDialog] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);

  useEffect(() => {
      loadPolicies();
      loadTriagePolicies();
  }, []);

  const loadPolicies = async () => {
      try {
          const data = await ApiClient.getPolicies();
          setPolicies(data);
          
          // Select active policy by default, or first one
          const active = data.find(p => p.isActive);
          if (active) selectPolicy(active);
          else if (data.length > 0) selectPolicy(data[0]);
      } catch (error) {
          console.error("Failed to load policies", error);
      }
  };

  const loadTriagePolicies = async () => {
    try {
      const data = await ApiClient.getTriagePolicies();
      setTriagePolicies(data);
      
      const prov = data.find(p => p.key === 'distress_provisional_boost');
      if (prov) setProvisionalBoost(parseInt(prov.value));
      
      const conf = data.find(p => p.key === 'distress_confirmed_boost');
      if (conf) setConfirmedBoost(parseInt(conf.value));
      
      const time = data.find(p => p.key === 'distress_provisional_timeout');
      if (time) setTimeoutDuration(parseInt(time.value));
    } catch (error) {
      console.error("Failed to load triage policies", error);
    }
  };

  const selectPolicy = (policy: Policy) => {
      setSelectedPolicyId(policy.id);
      setSeverityWeight(policy.severityWeight);
      setAgingRate(policy.agingRateMinutes);
      setEnableAging(policy.enableAging);
      setDistressDecay(policy.distressDecay);
      
      if (policy.isAlertMode) {
          setShowCrisisAlert(true);
      } else {
          setShowCrisisAlert(false);
      }
  };

  // Handlers
  const handlePolicyChange = (policyId: string) => {
    const policy = policies.find(p => p.id === policyId);
    if (policy) selectPolicy(policy);
  };

  const handleSavePolicy = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmSave = async () => {
    setShowConfirmDialog(false);
    setShowLoadingDialog(true);
    
    try {
        // 1. Update Standard Policies
        if (selectedPolicyId) {
            await ApiClient.updatePolicy({
                id: selectedPolicyId,
                severityWeight,
                agingRateMinutes: agingRate,
                enableAging,
                distressDecay,
                isAlertMode: showCrisisAlert
            });
        }

        // 2. Update Triage Policies (Supabase)
        await Promise.all([
          ApiClient.updateTriagePolicy('distress_provisional_boost', provisionalBoost.toString()),
          ApiClient.updateTriagePolicy('distress_confirmed_boost', confirmedBoost.toString()),
          ApiClient.updateTriagePolicy('distress_provisional_timeout', timeout.toString()),
          ApiClient.updateTriagePolicy('severity_weight', (severityWeight * 10).toString()),
          ApiClient.updateTriagePolicy('aging_factor', (agingRate / 10).toString()),
        ]);

        // 3. Sync to Simulation (Java Backend)
        await Promise.all([
          ApiClient.syncPolicyToSimulation('distress_provisional_boost', provisionalBoost),
          ApiClient.syncPolicyToSimulation('distress_confirmed_boost', confirmedBoost),
          ApiClient.syncPolicyToSimulation('distress_provisional_timeout', timeout),
          ApiClient.syncPolicyToSimulation('severity_weight', severityWeight * 10),
          ApiClient.syncPolicyToSimulation('aging_factor', agingRate / 10),
        ]);
        
        await loadPolicies();
        await loadTriagePolicies();
        
        setShowLoadingDialog(false);
        setShowToast(true);
        window.setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
        console.error("Failed to save policy", error);
        setShowLoadingDialog(false);
    }
  };

  const handleReset = () => {
    if (selectedPolicyId) {
        const original = policies.find(p => p.id === selectedPolicyId);
        if (original) selectPolicy(original);
    }
    loadTriagePolicies();
  };

  return (
    <div className="min-h-screen bg-neutral-bg-main p-8 font-sans">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <h1 className="text-3xl font-bold text-neutral-text-primary">
            Triage Policy Configuration
          </h1>
          <p className="mt-2 max-w-3xl text-neutral-text-secondary">
            Manage administrative triage logic parameters for the Adaptive
            City-Scale Hospital Triage System. Changes here affect real-time
            patient prioritization.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-neutral-border bg-white px-3 py-1.5 text-sm font-medium shadow-sm">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-system-success opacity-75"></span>
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-system-success"></span>
          </span>
          <span className="text-neutral-text-secondary">
            System Status: Online
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Active Policies */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="overflow-hidden border-none shadow-sm bg-white py-0 gap-0">
            <div className="flex items-center justify-between p-6 pb-2">
              <h2 className="text-lg font-bold text-neutral-text-primary">
                Available Policies
              </h2>
              <button className="text-brand-primary hover:bg-brand-primary/10 rounded-full p-1 transition-colors">
                <Plus size={20} />
              </button>
            </div>

            <div className="p-4 space-y-3">
              {policies.map((policy) => (
                <div
                  key={policy.id}
                  onClick={() => handlePolicyChange(policy.id)}
                  className={`relative flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all duration-200 ${selectedPolicyId === policy.id
                      ? "border-brand-primary/30 bg-alert-bg-sky shadow-sm ring-1 ring-brand-primary/20"
                      : "border-transparent hover:bg-neutral-bg-main"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full border transition-colors ${selectedPolicyId === policy.id
                          ? "border-brand-primary bg-brand-primary"
                          : "border-neutral-text-muted bg-transparent"
                        }`}
                    >
                      {selectedPolicyId === policy.id && (
                        <div className="h-2 w-2 rounded-full bg-white" />
                      )}
                    </div>
                    <div>
                      <p
                        className={`font-semibold ${selectedPolicyId === policy.id ? "text-brand-primary" : "text-neutral-text-primary"}`}
                      >
                        {policy.name}
                      </p>
                      <p className="text-xs text-neutral-text-secondary">
                        {policy.description}
                      </p>
                    </div>
                  </div>

                  {policy.isActive && !policy.isAlertMode && (
                    <div className="rounded-full bg-brand-primary text-white p-0.5">
                      <Check size={14} strokeWidth={3} />
                    </div>
                  )}

                  {policy.isAlertMode && (
                    <AlertTriangle className="text-severity-urgent" size={18} />
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Info Box */}
          <div className="rounded-xl bg-alert-bg-sky border border-brand-primary/10 p-4 flex gap-3 text-sm text-neutral-text-secondary">
            <Info className="text-brand-primary shrink-0" size={20} />
            <p className="leading-relaxed">
              The selected policy is currently active across 12 connected triage
              nodes. Changes will propagate within 30 seconds.
            </p>
          </div>
        </div>

        {/* Right Column: Configuration */}
        <div className="lg:col-span-8 space-y-6">
          {/* Severity & Priority Card */}
          <Card className="border-none shadow-sm bg-white p-6 md:p-8 py-0 gap-0">
            <div className="pt-6 md:pt-8 flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-brand-primary">!</span>
                <h2 className="text-lg font-bold text-neutral-text-primary">
                  Severity & Priority
                </h2>
              </div>
              <Badge
                variant="secondary"
                className="bg-alert-bg-sky text-brand-primary hover:bg-alert-bg-sky/80 uppercase tracking-wider font-semibold text-[10px] px-2 py-0.5 rounded-sm"
              >
                Weights
              </Badge>
            </div>

            <div className="space-y-10">
              {/* Severity Weight Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-transparent">
                  <label className="text-sm font-medium text-neutral-text-primary">
                    Severity Weight
                  </label>
                  <span className="text-base font-bold text-brand-primary">
                    {severityWeight.toFixed(2)}
                  </span>
                </div>
                <CustomSlider
                  value={severityWeight}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={setSeverityWeight}
                />
                <p className="text-xs text-neutral-text-secondary">
                  Multiplier for patient acuity score. Higher values prioritize
                  immediate medical condition over wait time.
                </p>
              </div>

              {/* Aging Rate Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-neutral-text-primary">
                    Aging Rate (Minutes)
                  </label>
                  <span className="text-base font-bold text-brand-primary">
                    {agingRate} min
                  </span>
                </div>
                <CustomSlider
                  value={agingRate}
                  min={1}
                  max={60}
                  step={1}
                  onChange={setAgingRate}
                />
                <p className="text-xs text-neutral-text-secondary">
                  Duration before a patient's priority score is automatically
                  escalated due to wait time.
                </p>
              </div>

              <div className="h-px bg-neutral-border border-t border-dashed w-full my-4" />

              {/* Enable Aging Escalation Toggle */}
              <div className="flex items-center justify-between relative">
                <div className="z-10">
                  <h3 className="text-sm font-medium text-neutral-text-primary">
                    Enable Aging Escalation
                  </h3>
                  <p className="text-xs text-neutral-text-secondary mt-1">
                    Allow wait time to influence priority
                  </p>
                </div>
                <CustomSwitch
                  checked={enableAging}
                  onCheckedChange={setEnableAging}
                />
              </div>
            </div>
          </Card>

          {/* Distress Signals & HITL Card */}
          <Card className="border-none shadow-sm bg-white p-6 md:p-8 py-0 gap-0">
            <div className="pt-6 md:pt-8 flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <ShieldAlert className="text-amber-500 h-5 w-5" />
                <h2 className="text-lg font-bold text-neutral-text-primary">
                  HITL & Distress Workflow
                </h2>
              </div>
              <Badge
                variant="secondary"
                className="bg-amber-50 text-amber-600 hover:bg-amber-100 uppercase tracking-wider font-semibold text-[10px] px-2 py-0.5 rounded-sm"
              >
                Supervised
              </Badge>
            </div>

            <div className="space-y-10">
              {/* Provisional Boost Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-transparent">
                  <label className="text-sm font-medium text-neutral-text-primary">
                    Provisional Distress Boost
                  </label>
                  <span className="text-base font-bold text-amber-500">
                    +{provisionalBoost}
                  </span>
                </div>
                <CustomSlider
                  value={provisionalBoost}
                  min={0}
                  max={100}
                  step={5}
                  onChange={setProvisionalBoost}
                />
                <p className="text-xs text-neutral-text-secondary">
                  Priority added immediately while waiting for nurse confirmation.
                </p>
              </div>

              {/* Confirmed Boost Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-transparent">
                  <label className="text-sm font-medium text-neutral-text-primary">
                    Confirmed Distress Boost
                  </label>
                  <span className="text-base font-bold text-green-600">
                    +{confirmedBoost}
                  </span>
                </div>
                <CustomSlider
                  value={confirmedBoost}
                  min={0}
                  max={200}
                  step={10}
                  onChange={setConfirmedBoost}
                />
                <p className="text-xs text-neutral-text-secondary">
                  Total priority boost applied once the nurse confirms the signal.
                </p>
              </div>

              {/* Timeout Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-transparent">
                  <label className="text-sm font-medium text-neutral-text-primary">
                    Confirmation Timeout (Seconds)
                  </label>
                  <span className="text-base font-bold text-neutral-text-primary">
                    {timeout}s
                  </span>
                </div>
                <CustomSlider
                  value={timeout}
                  min={30}
                  max={600}
                  step={30}
                  onChange={setTimeoutDuration}
                />
                <p className="text-xs text-neutral-text-secondary">
                  If not confirmed within this time, the provisional boost is automatically rolled back.
                </p>
              </div>

              <div className="h-px bg-neutral-border border-t border-dashed w-full my-4" />

              <div className="space-y-4 pb-8">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-neutral-text-primary">
                    Distress Decay Rate
                  </label>
                  <span className="text-lg font-bold text-brand-primary">
                    {distressDecay}
                  </span>
                </div>
                <CustomSlider
                  value={distressDecay}
                  min={0.1}
                  max={1.0}
                  step={0.1}
                  onChange={setDistressDecay}
                />
              </div>
            </div>
          </Card>

          {/* Overload Handling Card (Partial) */}
          <Card className="border-none shadow-sm bg-white p-6 md:p-8 pb-32 relative overflow-hidden py-0 gap-0">
            <div className="pt-6 md:pt-8 flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {/* Using a triangle icon to mimic the screenshot's 'up arrow/triangle' look */}
                <span className="text-brand-primary font-bold text-lg">▲</span>
                <h2 className="text-lg font-bold text-neutral-text-primary">
                  Overload Handling
                </h2>
              </div>
              <Badge
                variant="secondary"
                className="bg-amber-50 text-amber-600 hover:bg-amber-100 uppercase tracking-wider font-semibold text-[10px] px-2 py-0.5 rounded-sm"
              >
                Failsafe
              </Badge>
            </div>
            {/* Fading effect to simulate scrolling or content below */}
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-linear-to-t from-white to-transparent pointer-events-none" />
          </Card>

          {/* Footer */}
          <div className="sticky bottom-4 z-50 mt-8 rounded-2xl bg-white/80 p-4 shadow-lg backdrop-blur-md border border-neutral-border/50">
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={handleReset}
                className="text-neutral-text-secondary border-neutral-border hover:bg-neutral-bg-main rounded-xl px-6"
              >
                Reset Changes
              </Button>
              <Button
                onClick={handleSavePolicy}
                className="bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl px-6 shadow-md shadow-brand-primary/20 flex items-center gap-2"
              >
                <Save size={18} />
                Save Policy
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Crisis Alert Banner */}
      {showCrisisAlert && (
        <div className="fixed top-20 left-0 right-0 z-50 px-8">
          <AlertBanner
            variant="error"
            title="Crisis Override Mode Activated"
            description="This policy is designed for mass casualty events. All standard triage protocols will be overridden."
            action={{
              label: "View Documentation",
              onClick: () => console.log("View docs"),
            }}
            onDismiss={() => setShowCrisisAlert(false)}
          />
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        title="Confirm Policy Changes"
        description={`Are you sure you want to save changes to ${policies.find(p => p.id === selectedPolicyId)?.name || "this policy"}?`}
        highlightedText={policies.find(p => p.id === selectedPolicyId)?.name}
        impactText="Changes will propagate to 12 connected triage nodes within 30 seconds."
        confirmLabel="Save Policy"
        cancelLabel="Cancel"
        onConfirm={handleConfirmSave}
        variant="warning"
      />

      {/* Loading Dialog */}
      <LoadingDialog
        open={showLoadingDialog}
        title="Saving Policy"
        description="Please wait while we save your policy changes..."
      />

      {/* Success Toast */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50">
          <SuccessToast
            title="Policy Saved Successfully"
            description="Your changes have been applied to all connected triage nodes."
            onClose={() => setShowToast(false)}
            variant="success"
          />
        </div>
      )}
    </div>
  );
};



export default PolicyConfig;

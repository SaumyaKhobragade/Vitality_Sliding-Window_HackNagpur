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
import { Policy } from "@/lib/types";

const PolicyConfig = () => {
  // State for configuration
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null);
  
  // Form State
  const [severityWeight, setSeverityWeight] = useState(0.85);
  const [agingRate, setAgingRate] = useState(15); // Minutes
  const [enableAging, setEnableAging] = useState(true);
  const [distressDecay, setDistressDecay] = useState(0.5);

  // State for dialogs and toasts
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showLoadingDialog, setShowLoadingDialog] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);

  useEffect(() => {
      loadPolicies();
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
    if (!selectedPolicyId) return;
    
    setShowConfirmDialog(false);
    setShowLoadingDialog(true);
    
    try {
        await ApiClient.updatePolicy({
            id: selectedPolicyId,
            severityWeight,
            agingRateMinutes: agingRate,
            enableAging,
            distressDecay,
            isAlertMode: showCrisisAlert // Persist alert mode if toggled? Or assume it's static per policy type?
            // Note: isActive is not toggled by this form save, likely separate action. 
            // But we can assume saving makes it active or keeps it active.
        });
        
        await loadPolicies(); // Refresh
        
        setShowLoadingDialog(false);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
        console.error("Failed to save policy", error);
        setShowLoadingDialog(false);
        // Add error toast handling here if needed
    }
  };

  const handleReset = () => {
    if (selectedPolicyId) {
        const original = policies.find(p => p.id === selectedPolicyId);
        if (original) selectPolicy(original);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-bg-main p-8 font-sans">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-neutral-text-secondary">
            <span>Admin</span>
            <span>/</span>
            <span>Configuration</span>
            <span>/</span>
            <span className="font-semibold text-neutral-text-primary">
              Policies
            </span>
          </div>
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

          {/* Distress Signals Card */}
          <Card className="border-none shadow-sm bg-white p-6 md:p-8 py-0 gap-0">
            <div className="pt-6 md:pt-8 flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <Activity className="text-neutral-text-secondary h-5 w-5" />
                <h2 className="text-lg font-bold text-neutral-text-primary">
                  Distress Signals
                </h2>
              </div>
              <Badge
                variant="secondary"
                className="bg-purple-50 text-purple-600 hover:bg-purple-100 uppercase tracking-wider font-semibold text-[10px] px-2 py-0.5 rounded-sm"
              >
                Vitals
              </Badge>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-neutral-text-primary">
                  Distress Decay Rate
                </label>
                <span className="text-lg font-bold text-brand-primary">
                  {distressDecay < 0.3
                    ? "Slow"
                    : distressDecay > 0.7
                      ? "Fast"
                      : "Medium"}{" "}
                  ({distressDecay})
                </span>
              </div>
              <CustomSlider
                value={distressDecay}
                min={0.1}
                max={1.0}
                step={0.1}
                onChange={setDistressDecay}
              />
              <div className="flex justify-between text-[10px] uppercase font-bold text-neutral-text-muted tracking-wider">
                <span>Slow</span>
                <span>Fast</span>
              </div>
              <p className="text-xs text-neutral-text-secondary pt-1">
                Rate at which transient vital sign anomalies normalize in the
                calculation model.
              </p>
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
    </div>
  );
};



export default PolicyConfig;

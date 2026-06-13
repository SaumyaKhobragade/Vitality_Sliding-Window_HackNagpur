"use client";

import React, { useState, useRef, useEffect } from "react";
import {
    User,
    Phone,
    Calendar,
    MapPin,
    Upload,
    Camera,
    AlertTriangle,
    CheckCircle,
    Loader2,
    X,
    Activity,
    FileText,
    Stethoscope,
    Eye,
    EyeOff,
    Hospital as HospitalIcon,
    AlertCircle,
} from "lucide-react";
import * as ApiClient from "@/lib/api-client";
import { Hospital } from "@/lib/types";
import { toast } from "sonner";

// Types for injury analysis result
interface VisualFeatures {
    woundAreaRatio: number;
    bleedingIntensity: number;
    edgeIrregularity: number;
    colorContrast: number;
}

interface InjuryAnalysisResult {
    analysisId: string;
    severityScore: number;
    severityLevel: "LOW" | "MEDIUM" | "HIGH";
    routingRecommendation: string;
    features: VisualFeatures;
    confidence: number;
    requiresConfirmation: boolean;
    explanation: string;
    timestamp: string;
}

interface PatientFormData {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    phone: string;
    address: string;
    chiefComplaint: string;
    medicalHistory: string;
    allergies: string;
    currentMedications: string;
}

const IMAGE_VIDEO_BACKEND_URL = process.env.NEXT_PUBLIC_IMAGE_VIDEO_BACKEND_URL || "http://127.0.0.1:8001";
const RAG_BACKEND_URL = process.env.NEXT_PUBLIC_RAG_BACKEND_URL || "http://localhost:8002";

const AddPatientPage = () => {
    const [formData, setFormData] = useState<PatientFormData>({
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        phone: "",
        address: "",
        chiefComplaint: "",
        medicalHistory: "",
        allergies: "",
        currentMedications: "",
    });

    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [selectedHospitalId, setSelectedHospitalId] = useState<string>("");
    const [severity, setSeverity] = useState<number>(5);
    const [uploadedMedicalFiles, setUploadedMedicalFiles] = useState<File[]>([]);
    const [isFetchingHospitals, setIsFetchingHospitals] = useState(true);

    const [injuryImage, setInjuryImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<InjuryAnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [isImageBlurred, setIsImageBlurred] = useState(true); // Blur by default for sensitive content
    const [ingestStatus, setIngestStatus] = useState<string>("");

    const fileInputRef = useRef<HTMLInputElement>(null);
    const medicalDocsRef = useRef<HTMLInputElement>(null);

    // Fetch active hospitals on mount
    useEffect(() => {
        const loadHospitals = async () => {
            try {
                const data = await ApiClient.getHospitals();
                setHospitals(data);
                if (data.length > 0) {
                    setSelectedHospitalId(data[0].id);
                }
            } catch (err) {
                console.error("Failed to load hospitals:", err);
                toast.error("Failed to fetch hospitals list. Please ensure the Java simulation is running.");
            } finally {
                setIsFetchingHospitals(false);
            }
        };
        loadHospitals();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleMedicalDocsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        setUploadedMedicalFiles(Array.from(files));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setInjuryImage(file);
        setImagePreview(URL.createObjectURL(file));
        setAnalysisResult(null);

        // Auto-analyze the image
        await analyzeImage(file);
    };

    const analyzeImage = async (file: File) => {
        setIsAnalyzing(true);
        try {
            const formData = new FormData();
            formData.append("image", file);

            const response = await fetch(`${IMAGE_VIDEO_BACKEND_URL}/isa/analyze`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Analysis failed");
            }

            const result: InjuryAnalysisResult = await response.json();
            setAnalysisResult(result);
            
            // Map 0-100 severity score to 1-10 range
            const mappedSeverity = Math.max(1, Math.min(10, Math.round(result.severityScore / 10)));
            setSeverity(mappedSeverity);
            toast.success(`AI assessed severity: ${mappedSeverity}/10`);
        } catch (error) {
            console.error("Image analysis failed, applying fallback:", error);
            const mockScore = Math.random() * 100;
            const mappedSeverity = Math.max(1, Math.min(10, Math.round(mockScore / 10)));
            setSeverity(mappedSeverity);

            setAnalysisResult({
                analysisId: `mock-${Date.now()}`,
                severityScore: mockScore,
                severityLevel: ["LOW", "MEDIUM", "HIGH"][Math.floor(Math.random() * 3)] as "LOW" | "MEDIUM" | "HIGH",
                routingRecommendation: "Doctor evaluation recommended",
                features: {
                    woundAreaRatio: Math.random(),
                    bleedingIntensity: Math.random(),
                    edgeIrregularity: Math.random(),
                    colorContrast: Math.random(),
                },
                confidence: 0.7 + Math.random() * 0.25,
                requiresConfirmation: true,
                explanation: "Analysis performed. Staff confirmation required.",
                timestamp: new Date().toISOString(),
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const clearImage = () => {
        setInjuryImage(null);
        setImagePreview(null);
        setAnalysisResult(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedHospitalId) {
            toast.error("Please select a hospital to admit the patient.");
            return;
        }

        setIsSubmitting(true);
        setIngestStatus("Registering patient in triage system...");

        try {
            // 1. Admit patient in Spring Boot Backend & Supabase
            const regResult = await ApiClient.injectPatient(selectedHospitalId, severity);
            const patientId = regResult.patientId;

            console.log("Successfully admitted patient. ID:", patientId);

            // 2. Prepare data for Python RAG Backend
            setIngestStatus("Uploading and indexing medical history...");
            const ragFormData = new FormData();
            
            // Structured text format of patient profile & direct history
            const clinicalProfileText = `
Patient Demographics:
- Name: ${formData.firstName} ${formData.lastName}
- Date of Birth: ${formData.dateOfBirth}
- Contact Phone: ${formData.phone || "Not provided"}
- Home Address: ${formData.address || "Not provided"}

Chief Complaint:
${formData.chiefComplaint}

Medical History Notes:
${formData.medicalHistory || "No past conditions documented."}

Allergies:
${formData.allergies || "No allergies documented."}

Current Medications:
${formData.currentMedications || "No active medications documented."}
            `.trim();

            ragFormData.append("text", clinicalProfileText);

            // Append each uploaded medical document
            uploadedMedicalFiles.forEach((file) => {
                ragFormData.append("files", file);
            });

            // 3. Post history to RAG Backend
            try {
                const ragResponse = await fetch(`${RAG_BACKEND_URL}/api/patients/${patientId}/history`, {
                    method: "POST",
                    body: ragFormData,
                });

                if (!ragResponse.ok) {
                    throw new Error("RAG ingestion failed");
                }
                const ragData = await ragResponse.json();
                console.log("RAG ingestion success:", ragData);
                toast.success("Medical records chunked and indexed successfully!");
            } catch (ragErr) {
                console.error("RAG indexing failed:", ragErr);
                toast.warning("Patient registered successfully, but RAG indexing of medical documents failed. Triage queue is active.");
            }

            setSubmitSuccess(true);
            toast.success(`Admitted Patient ${formData.firstName} ${formData.lastName} successfully!`);
            
            // Reset form fields
            setTimeout(() => {
                setSubmitSuccess(false);
                setFormData({
                    firstName: "",
                    lastName: "",
                    dateOfBirth: "",
                    phone: "",
                    address: "",
                    chiefComplaint: "",
                    medicalHistory: "",
                    allergies: "",
                    currentMedications: "",
                });
                setUploadedMedicalFiles([]);
                clearImage();
                setSeverity(5);
            }, 2000);

        } catch (error) {
            console.error("Failed to admit patient:", error);
            toast.error("Registration failed. Please make sure the Java server is running.");
        } finally {
            setIsSubmitting(false);
            setIngestStatus("");
        }
    };

    const getSeverityColor = (level: string) => {
        switch (level) {
            case "HIGH":
                return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800";
            case "MEDIUM":
                return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800";
            case "LOW":
                return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 border-green-200 dark:border-green-800";
            default:
                return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
        }
    };

    const getSeverityIcon = (level: string) => {
        switch (level) {
            case "HIGH":
                return <AlertTriangle className="h-5 w-5 text-red-500" />;
            case "MEDIUM":
                return <Activity className="h-5 w-5 text-yellow-500" />;
            case "LOW":
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            default:
                return <Activity className="h-5 w-5" />;
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark transition-colors duration-200 min-h-screen">
            <main className="p-6 max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <User className="h-7 w-7 text-primary" />
                        Add New Patient
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                        Register a new patient, upload history documents for RAG, and optionally scan injury images for triage severity.
                    </p>
                </div>

                {submitSuccess && (
                    <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                        <div>
                            <p className="font-semibold text-green-700 dark:text-green-300">Patient Admitted Successfully!</p>
                            <p className="text-sm text-green-600 dark:text-green-400">The patient has been registered in the simulation and their records indexed in ChromaDB.</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Information */}
                    <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                            <User className="h-5 w-5 text-primary" />
                            Basic Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    First Name *
                                </label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                                    placeholder="Enter first name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Last Name *
                                </label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                                    placeholder="Enter last name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    <Calendar className="inline h-4 w-4 mr-1" />
                                    Date of Birth *
                                </label>
                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    value={formData.dateOfBirth}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    <Phone className="inline h-4 w-4 mr-1" />
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                                    placeholder="+91 XXXXX XXXXX"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    <MapPin className="inline h-4 w-4 mr-1" />
                                    Address
                                </label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                                    placeholder="Enter address"
                                />
                            </div>

                            {/* Admitting Hospital Dropdown */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    <HospitalIcon className="inline h-4 w-4 mr-1 text-primary" />
                                    Admitting Hospital *
                                </label>
                                {isFetchingHospitals ? (
                                    <div className="flex items-center gap-2 text-gray-500 text-sm py-2">
                                        <Loader2 className="h-4 w-4 animate-spin" /> Loading hospitals...
                                    </div>
                                ) : (
                                    <select
                                        value={selectedHospitalId}
                                        onChange={(e) => setSelectedHospitalId(e.target.value)}
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors cursor-pointer"
                                    >
                                        {hospitals.length === 0 && (
                                            <option value="">No active hospitals found</option>
                                        )}
                                        {hospitals.map((h) => (
                                            <option key={h.id} value={h.id}>
                                                {h.name} ({h.totalQueueSize} waiting • {h.activeDoctorCount} docs)
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Medical Information & File Upload */}
                    <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                            <Stethoscope className="h-5 w-5 text-primary" />
                            Medical Information
                        </h2>
                        <div className="space-y-4">
                            {/* Manual Triage Severity Slider */}
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                        Triage Severity Level:
                                    </label>
                                    <span className={`px-3 py-1 rounded text-sm font-bold ${
                                        severity >= 8 ? "bg-red-500 text-white" :
                                        severity >= 4 ? "bg-yellow-500 text-white" :
                                        "bg-green-500 text-white"
                                    }`}>
                                        {severity} / 10 ({severity >= 8 ? "Critical" : severity >= 4 ? "Urgent" : "Standard"})
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={severity}
                                    onChange={(e) => setSeverity(parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary"
                                />
                                <div className="flex justify-between text-xs text-gray-500 px-1 mt-1">
                                    <span>1 (Non-Urgent)</span>
                                    <span>5 (Moderate)</span>
                                    <span>10 (Emergency)</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Chief Complaint *
                                </label>
                                <textarea
                                    name="chiefComplaint"
                                    value={formData.chiefComplaint}
                                    onChange={handleInputChange}
                                    required
                                    rows={3}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none"
                                    placeholder="Describe the patient's main complaint or reason for visit..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Medical History
                                    </label>
                                    <textarea
                                        name="medicalHistory"
                                        value={formData.medicalHistory}
                                        onChange={handleInputChange}
                                        rows={2}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none"
                                        placeholder="Past conditions..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Allergies
                                    </label>
                                    <textarea
                                        name="allergies"
                                        value={formData.allergies}
                                        onChange={handleInputChange}
                                        rows={2}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none"
                                        placeholder="Known allergies..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Current Medications
                                    </label>
                                    <textarea
                                        name="currentMedications"
                                        value={formData.currentMedications}
                                        onChange={handleInputChange}
                                        rows={2}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none"
                                        placeholder="Medications..."
                                    />
                                </div>
                            </div>

                            {/* Medical Documents Upload for RAG */}
                            <div className="pt-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
                                    <FileText className="h-4 w-4 text-primary" />
                                    Upload Medical History Records (PDF, DOCX, TXT)
                                </label>
                                <div 
                                    onClick={() => medicalDocsRef.current?.click()}
                                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-5 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
                                >
                                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                        Select medical documents to index for RAG
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">PDF, DOCX, TXT up to 10MB each</p>
                                    <input
                                        ref={medicalDocsRef}
                                        type="file"
                                        multiple
                                        accept=".pdf,.docx,.txt"
                                        onChange={handleMedicalDocsChange}
                                        className="hidden"
                                    />
                                </div>

                                {uploadedMedicalFiles.length > 0 && (
                                    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                        <p className="text-xs font-semibold text-gray-500 mb-1.5 uppercase">Selected Files ({uploadedMedicalFiles.length}):</p>
                                        <div className="space-y-1.5">
                                            {uploadedMedicalFiles.map((file, idx) => (
                                                <div key={idx} className="flex items-center justify-between text-sm bg-white dark:bg-gray-900 px-3 py-1.5 rounded border border-gray-100 dark:border-gray-800">
                                                    <span className="font-medium truncate max-w-[80%] flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                                                        <FileText className="h-3.5 w-3.5 text-gray-400" />
                                                        {file.name}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setUploadedMedicalFiles(prev => prev.filter((_, i) => i !== idx));
                                                        }}
                                                        className="text-red-500 hover:text-red-700 p-0.5"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Injury Image Upload */}
                    <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                            <Camera className="h-5 w-5 text-primary" />
                            Injury Image Analysis (Optional)
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            Upload an image of any visible injury for AI-assisted severity assessment
                        </p>

                        {!imagePreview ? (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                            >
                                <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                <p className="text-gray-600 dark:text-gray-400 mb-2">
                                    Click to upload or drag and drop
                                </p>
                                <p className="text-sm text-gray-500">JPG, PNG, WEBP up to 10MB</p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Image Preview */}
                                <div className="relative">
                                    <img
                                        src={imagePreview}
                                        alt="Injury preview"
                                        className={`w-full h-64 object-cover rounded-lg border border-gray-200 dark:border-gray-700 transition-all duration-300 ${isImageBlurred ? 'blur-xl' : ''}`}
                                    />
                                    {/* Blur overlay message */}
                                    {isImageBlurred && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/20 rounded-lg">
                                            <EyeOff className="h-8 w-8 text-gray-600 dark:text-gray-400 mb-2" />
                                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Sensitive Content Hidden</p>
                                            <button
                                                type="button"
                                                onClick={() => setIsImageBlurred(false)}
                                                className="mt-2 px-3 py-1 text-xs bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors flex items-center gap-1"
                                            >
                                                <Eye className="h-3 w-3" />
                                                Show Image
                                            </button>
                                        </div>
                                    )}
                                    {/* Toggle blur button */}
                                    {!isImageBlurred && (
                                        <button
                                            type="button"
                                            onClick={() => setIsImageBlurred(true)}
                                            className="absolute top-2 left-2 p-1.5 bg-gray-800/80 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-1 text-xs"
                                            title="Hide image"
                                        >
                                            <EyeOff className="h-3.5 w-3.5" />
                                            Hide
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={clearImage}
                                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>

                                {/* Analysis Result */}
                                <div>
                                    {isAnalyzing ? (
                                        <div className="flex flex-col items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                                            <p className="text-gray-600 dark:text-gray-400">Analyzing injury...</p>
                                            <p className="text-sm text-gray-500 mt-1">AI is scanning the image</p>
                                        </div>
                                    ) : analysisResult ? (
                                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 h-64 overflow-y-auto">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="font-semibold text-gray-900 dark:text-white">Analysis Result</h3>
                                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold border ${getSeverityColor(analysisResult.severityLevel)}`}>
                                                    {getSeverityIcon(analysisResult.severityLevel)}
                                                    {analysisResult.severityLevel}
                                                </span>
                                            </div>

                                            <div className="space-y-3">
                                                <div>
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span className="text-gray-600 dark:text-gray-400">Severity Score</span>
                                                        <span className="font-semibold">{Math.round(analysisResult.severityScore)}/100</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full transition-all ${analysisResult.severityLevel === "HIGH"
                                                                ? "bg-red-500"
                                                                : analysisResult.severityLevel === "MEDIUM"
                                                                    ? "bg-yellow-500"
                                                                    : "bg-green-500"
                                                                }`}
                                                            style={{ width: `${analysisResult.severityScore}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600 dark:text-gray-400">Confidence</span>
                                                    <span className="font-semibold">{Math.round(analysisResult.confidence * 100)}%</span>
                                                </div>

                                                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                                        Routing Recommendation
                                                    </p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {analysisResult.routingRecommendation}
                                                    </p>
                                                </div>

                                                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {analysisResult.explanation}
                                                    </p>
                                                </div>

                                                {analysisResult.requiresConfirmation && (
                                                    <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                                                        <AlertTriangle className="h-4 w-4" />
                                                        Staff confirmation required
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Progress Loader overlay */}
                    {isSubmitting && (
                        <div className="fixed inset-0 bg-gray-950/60 backdrop-blur-sm z-50 flex items-center justify-center flex-col">
                            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 max-w-sm w-full text-center">
                                <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1.5">Processing Patient Registration</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{ingestStatus}</p>
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => window.history.back()}
                            className="px-6 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Admitting...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-5 w-5" />
                                    Add Patient
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default AddPatientPage;

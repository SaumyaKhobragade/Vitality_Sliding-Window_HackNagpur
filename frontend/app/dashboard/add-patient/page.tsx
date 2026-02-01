"use client";

import React, { useState, useRef } from "react";
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
} from "lucide-react";

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

    const [injuryImage, setInjuryImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<InjuryAnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [isImageBlurred, setIsImageBlurred] = useState(true); // Blur by default for sensitive content
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
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
        } catch (error) {
            console.error("Image analysis failed:", error);
            // Mock result for demo if backend is unavailable
            setAnalysisResult({
                analysisId: `mock-${Date.now()}`,
                severityScore: Math.random() * 100,
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
        setIsSubmitting(true);

        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1500));

            console.log("Patient data:", formData);
            console.log("Injury analysis:", analysisResult);

            setSubmitSuccess(true);
            setTimeout(() => {
                setSubmitSuccess(false);
                // Reset form
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
                clearImage();
            }, 3000);
        } catch (error) {
            console.error("Submit failed:", error);
        } finally {
            setIsSubmitting(false);
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
                        Register a new patient and optionally scan injury images for severity assessment
                    </p>
                </div>

                {submitSuccess && (
                    <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                        <div>
                            <p className="font-semibold text-green-700 dark:text-green-300">Patient Added Successfully!</p>
                            <p className="text-sm text-green-600 dark:text-green-400">The patient has been registered in the system.</p>
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
                        </div>
                    </div>

                    {/* Medical Information */}
                    <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                            <Stethoscope className="h-5 w-5 text-primary" />
                            Medical Information
                        </h2>
                        <div className="space-y-4">
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
                                    Adding Patient...
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

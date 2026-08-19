"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { KycStatusResponse } from "@repo/api";
import { ApiError } from "@repo/api";
import {
  isoToJalaliDisplay,
  jalaliDisplayToIso,
} from "@/shared/lib/jalali";
import { accountKyc } from "@/shared/lib/api";
import { useAuth } from "@/shared/providers/AuthProvider";
import { useDevicePermissions } from "@/shared/providers/DevicePermissionsProvider";
import type { KycFlowStep } from "@/modules/account/screens/KycStatusScreen/KycStatusScreen.types";

const PROCESSING_TICK_MS = 900;

export function useKycStatus(roleSegment = "athlete") {
  const t = useTranslations("Mobile.Kyc");
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const { ensurePermission } = useDevicePermissions();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [step, setStep] = useState<KycFlowStep>("intro");
  const [status, setStatus] = useState<KycStatusResponse | null>(null);
  const [nationalId, setNationalId] = useState(user?.nationalId ?? "");
  const [birthDateJalali, setBirthDateJalali] = useState(
    isoToJalaliDisplay(user?.demographics.birthDate),
  );
  const [cameraReady, setCameraReady] = useState(false);
  const [processingIndex, setProcessingIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const profilePath = `/${roleSegment}/profile`;

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraReady(false);
  }, []);

  const load = useCallback(async () => {
    const next = await accountKyc.status();
    setStatus(next);
    if (next.kycStatus === "approved") {
      setStep("success");
    } else if (next.kycStatus === "pending") {
      setStep("pending");
    } else if (
      next.kycStatus === "rejected" ||
      next.identity.status === "rejected"
    ) {
      setStep("rejected");
    } else {
      setStep("intro");
    }
  }, []);

  useEffect(() => {
    void load().catch(() => {
      setError(t("error"));
    });
  }, [load, t]);

  useEffect(() => {
    if (step !== "scan") {
      stopCamera();
      return;
    }

    let cancelled = false;
    const start = async () => {
      if (!navigator.mediaDevices?.getUserMedia) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: { ideal: "environment" } },
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCameraReady(true);
        }
      } catch {
        setCameraReady(false);
      }
    };
    void start();

    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [step, stopCamera]);

  useEffect(() => {
    if (step !== "processing") return;
    setProcessingIndex(0);
    const timer = window.setInterval(() => {
      setProcessingIndex((current) => Math.min(current + 1, 2));
    }, PROCESSING_TICK_MS);
    return () => window.clearInterval(timer);
  }, [step]);

  const syncUser = (next: KycStatusResponse) => {
    setStatus(next);
    if (!user) return;
    refreshUser({
      ...user,
      nationalId: nationalId.trim() || user.nationalId,
      kyc: {
        status: next.kycStatus,
        verifiedAt: next.kycVerifiedAt,
      },
    });
  };

  const goBack = () => {
    setError(null);
    if (step === "details") {
      setStep("intro");
      return;
    }
    if (step === "scan") {
      setStep("details");
      return;
    }
    router.push(profilePath);
  };

  const handleDetails = (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    const iso = jalaliDisplayToIso(birthDateJalali);
    if (!/^\d{10}$/.test(nationalId.trim()) || !iso) {
      setError(t("errorDetails"));
      return;
    }
    void (async () => {
      const result = await ensurePermission("camera");
      if (result !== "granted") {
        setError(t("errorCamera"));
        return;
      }
      setStep("scan");
    })();
  };

  const submitCapturedFile = async (file: File) => {
    setError(null);
    setStep("processing");
    setIsPending(true);
    stopCamera();

    const iso = jalaliDisplayToIso(birthDateJalali);
    if (!iso) {
      setError(t("errorDetails"));
      setStep("details");
      setIsPending(false);
      return;
    }

    try {
      let next = await accountKyc.submitIdentity({
        nationalId: nationalId.trim(),
        birthDate: iso,
      });
      try {
        next = await accountKyc.submitDocument("national_card", file);
      } catch {
        // Document upload is best-effort.
      }
      syncUser(next);
      if (next.kycStatus === "approved") {
        setStep("success");
      } else if (next.kycStatus === "pending") {
        setStep("pending");
      } else {
        setStep("rejected");
        setError(next.identity.rejectionReason ?? t("errorRejected"));
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("error"));
      setStep("details");
    } finally {
      setIsPending(false);
    }
  };

  const captureFromCamera = async () => {
    const video = videoRef.current;
    if (!video || !cameraReady) {
      fileInputRef.current?.click();
      return;
    }
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) {
      fileInputRef.current?.click();
      return;
    }
    context.drawImage(video, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.92),
    );
    if (!blob) {
      fileInputRef.current?.click();
      return;
    }
    await submitCapturedFile(
      new File([blob], "national-card.jpg", { type: "image/jpeg" }),
    );
  };

  const tips = [t("tips.clear"), t("tips.blur"), t("tips.edges")] as const;

  const processingLabels = [
    t("processing.photo"),
    t("processing.identity"),
    t("processing.submit"),
  ] as const;

  return {
    t,
    router,
    step,
    status,
    nationalId,
    setNationalId,
    birthDateJalali,
    setBirthDateJalali,
    cameraReady,
    processingIndex,
    error,
    isPending,
    profilePath,
    videoRef,
    fileInputRef,
    tips,
    processingLabels,
    goBack,
    handleDetails,
    captureFromCamera,
    submitCapturedFile,
    setError,
    setStep,
  };
}

export type UseKycStatusReturn = ReturnType<typeof useKycStatus>;

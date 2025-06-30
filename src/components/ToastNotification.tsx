"use client";

import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  type: "success" | "error" | "info" | "warning";
  duration?: number;
  onClose: () => void;
}

export default function ToastNotification({ 
  message, 
  type, 
  duration = 4000, 
  onClose 
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        setIsVisible(false);
        onClose();
      }, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const getToastStyles = () => {
    switch (type) {
      case "success":
        return {
          bg: "bg-gradient-to-r from-green-500 to-emerald-600",
          icon: "✅",
          border: "border-green-200"
        };
      case "error":
        return {
          bg: "bg-gradient-to-r from-red-500 to-pink-600",
          icon: "❌",
          border: "border-red-200"
        };
      case "warning":
        return {
          bg: "bg-gradient-to-r from-yellow-500 to-orange-600",
          icon: "⚠️",
          border: "border-yellow-200"
        };
      case "info":
        return {
          bg: "bg-gradient-to-r from-blue-500 to-indigo-600",
          icon: "ℹ️",
          border: "border-blue-200"
        };
      default:
        return {
          bg: "bg-gradient-to-r from-gray-500 to-gray-600",
          icon: "💬",
          border: "border-gray-200"
        };
    }
  };

  const styles = getToastStyles();

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div 
        className={`${styles.bg} ${styles.border} border-2 rounded-lg shadow-lg p-4 text-white transform transition-all duration-300 ${
          isExiting 
            ? "translate-x-full opacity-0" 
            : "translate-x-0 opacity-100"
        } hover-lift`}
      >
        <div className="flex items-center gap-3">
          <div className="text-2xl animate-bounce">
            {styles.icon}
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">
              {message}
            </p>
          </div>
          <button
            onClick={() => {
              setIsExiting(true);
              setTimeout(() => {
                setIsVisible(false);
                onClose();
              }, 300);
            }}
            className="text-white hover:text-gray-200 transition-colors duration-200 focus-ring rounded-full p-1"
          >
            ✕
          </button>
        </div>
        
        {/* Barre de progression */}
        <div className="mt-3 w-full bg-white bg-opacity-20 rounded-full h-1">
          <div 
            className="bg-white h-1 rounded-full transition-all duration-300 ease-linear"
            style={{ 
              width: isExiting ? "0%" : "100%",
              transitionDuration: isExiting ? "300ms" : `${duration}ms`
            }}
          />
        </div>
      </div>
    </div>
  );
}

// Hook pour gérer les toasts
export function useToast() {
  const [toasts, setToasts] = useState<Array<{
    id: string;
    message: string;
    type: "success" | "error" | "info" | "warning";
    duration?: number;
  }>>([]);

  const addToast = (
    message: string, 
    type: "success" | "error" | "info" | "warning" = "info",
    duration?: number
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showSuccess = (message: string, duration?: number) => {
    addToast(message, "success", duration);
  };

  const showError = (message: string, duration?: number) => {
    addToast(message, "error", duration);
  };

  const showInfo = (message: string, duration?: number) => {
    addToast(message, "info", duration);
  };

  const showWarning = (message: string, duration?: number) => {
    addToast(message, "warning", duration);
  };

  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showInfo,
    showWarning
  };
}

// Composant ToastContainer pour afficher tous les toasts
export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <ToastNotification
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
} 
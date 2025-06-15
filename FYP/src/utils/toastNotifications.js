import { toast } from "react-toastify";

// Success notifications
export const showSuccess = (message) => {
  toast.success(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });
};

// Error notifications
export const showError = (error) => {
  const errorMessage =
    error?.response?.data?.msg || error?.message || "An error occurred";
  toast.error(errorMessage, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });
};

// Warning notifications
export const showWarning = (message) => {
  toast.warning(message, {
    position: "top-right",
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });
};

// Info notifications
export const showInfo = (message) => {
  toast.info(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });
};

// Loading notification
export const showLoading = (message = "Loading...") => {
  return toast.loading(message, {
    position: "top-right",
    closeOnClick: false,
    closeButton: false,
  });
};

// Update loading notification
export const updateLoading = (toastId, message, type = "success") => {
  toast.update(toastId, {
    render: message,
    type: type,
    isLoading: false,
    autoClose: 3000,
    closeButton: true,
  });
};

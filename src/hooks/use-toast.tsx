
import * as React from "react";
import {
  Toast,
  type ToastActionElement,
  type ToastProps,
} from "@/components/UI/toast";

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 1000000;

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const;

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_VALUE;
  return count.toString();
}

type ActionType = typeof actionTypes;

type Action =
  | {
      type: ActionType["ADD_TOAST"];
      toast: ToasterToast;
    }
  | {
      type: ActionType["UPDATE_TOAST"];
      toast: Partial<ToasterToast>;
    }
  | {
      type: ActionType["DISMISS_TOAST"];
      toastId?: string;
    }
  | {
      type: ActionType["REMOVE_TOAST"];
      toastId?: string;
    };

interface State {
  toasts: ToasterToast[];
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case actionTypes.DISMISS_TOAST: {
      const { toastId } = action;

      if (toastId) {
        toastTimeouts.forEach((_, key) => {
          if (key === toastId) {
            toastTimeouts.delete(key);
          }
        });
      } else {
        toastTimeouts.forEach((_, key) => {
          toastTimeouts.delete(key);
        });
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      };
    }
    case actionTypes.REMOVE_TOAST:
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
    default:
      return state;
  }
};

// Type for the toast function input parameters
type ToastOptions = Partial<Omit<ToasterToast, "id">> & { duration?: number };

// Create a React context for toast state
const ToastContext = React.createContext<{
  toast: (options: ToastOptions) => { id: string; dismiss: () => void; update: (props: ToastOptions) => void };
  toasts: ToasterToast[];
  dismiss: (toastId?: string) => void;
} | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducer, { toasts: [] });

  React.useEffect(() => {
    state.toasts.forEach((toast) => {
      if (toast.open && !toastTimeouts.has(toast.id)) {
        const timeout = setTimeout(() => {
          dispatch({
            type: actionTypes.DISMISS_TOAST,
            toastId: toast.id,
          });

          setTimeout(() => {
            dispatch({
              type: actionTypes.REMOVE_TOAST,
              toastId: toast.id,
            });
          }, TOAST_REMOVE_DELAY);
        }, toast.duration || 5000);

        toastTimeouts.set(toast.id, timeout);
      }
    });
  }, [state.toasts]);

  const toast = React.useCallback(
    (props: ToastOptions) => {
      const id = genId();

      dispatch({
        type: actionTypes.ADD_TOAST,
        toast: {
          ...props,
          id,
          open: true,
        } as ToasterToast,
      });

      return {
        id,
        dismiss: () =>
          dispatch({
            type: actionTypes.DISMISS_TOAST,
            toastId: id,
          }),
        update: (props: ToastOptions) =>
          dispatch({
            type: actionTypes.UPDATE_TOAST,
            toast: { ...props, id } as Partial<ToasterToast>,
          }),
      };
    },
    [dispatch]
  );

  const value = React.useMemo(
    () => ({
      toast,
      toasts: state.toasts,
      dismiss: (toastId?: string) =>
        dispatch({ type: actionTypes.DISMISS_TOAST, toastId }),
    }),
    [state.toasts, toast]
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const context = React.useContext(ToastContext);
  
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  
  return context;
}

// Re-export a safe standalone toast function that doesn't rely on React hooks
export const toast = (props: ToastOptions) => {
  // This is just a stub that logs to console if used outside of React
  console.warn("toast() was called outside of a React component. Use useToast() hook inside components instead.");
  
  return {
    id: "toast-outside-react",
    dismiss: () => {},
    update: () => {},
  };
};

export { type ToasterToast };

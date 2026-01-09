"use client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toast } from 'primereact/toast';
import { useRef } from "react";
import { Provider } from "react-redux";
import { store } from '../_state/_global/Store';
import { queryClient } from '../_state/_remote/QueryClient';

export default function Providers({ children }) {
  const toast = useRef(null);

  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <ReactQueryDevtools initialIsOpen={false} />
        {children}
        <Toast ref={toast} />
      </Provider>
    </QueryClientProvider>
  );
}

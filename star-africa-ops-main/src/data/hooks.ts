import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "./context";
import type { Invoice, Receipt, RecordInput } from "./types";
export function useRecords() {
  const api = useRepository();
  return useQuery({ queryKey: ["records"], queryFn: () => api.listRecords(), staleTime: 30_000 });
}
export function useInvoices() {
  const api = useRepository();
  return useQuery({ queryKey: ["invoices"], queryFn: () => api.listInvoices(), staleTime: 30_000 });
}
export function useSaveRecord() {
  const api = useRepository();
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: RecordInput) => api.saveRecord(input),
    onSuccess: () => client.invalidateQueries({ queryKey: ["records"] }),
  });
}
export function useDeleteRecord() {
  const api = useRepository();
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteRecord(id),
    onSuccess: () => client.invalidateQueries({ queryKey: ["records"] }),
  });
}
export function useSaveInvoice() {
  const api = useRepository();
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: Invoice) => api.saveInvoice(input),
    onSuccess: () => client.invalidateQueries({ queryKey: ["invoices"] }),
  });
}
export function useConfirmReceipt() {
  const api = useRepository();
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: Receipt) => api.confirmReceipt(input),
    onSuccess: () => client.invalidateQueries({ queryKey: ["records"] }),
  });
}

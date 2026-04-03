import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { selfSettle } from "@/utils/api";
import toast from "react-hot-toast";

type SelfSettleModalProps = {
  open: boolean;
  onClose: () => void;
};

export const SelfSettleModal = ({ open, onClose }: SelfSettleModalProps) => {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: { amount: number }) => selfSettle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settlements"] });
      onClose();
      setAmount("");
      toast.success("Self Settle Request sent Successfully");
    },
    onError: (err: any) => {
      setError(err?.message || "Something went wrong");
    },
  });

  const formatWithCommas = (val: string) => {
    const num = val.replace(/,/g, "");
    if (!num) return "";
    return parseInt(num, 10).toLocaleString("en-IN");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, "");
    if (/^\d*$/.test(raw)) {
      setAmount(formatWithCommas(raw));
    }
  };

  const handleConfirm = () => {
    const numericValue = parseInt(amount.replace(/,/g, ""), 10);
    if (!numericValue || numericValue <= 0) {
      setError("Please enter a valid amount greater than 0");
      return;
    }
    setError("");
    mutation.mutate({ amount: numericValue });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Self Transfer</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <label className="block mb-2 text-sm font-medium">Amount (INR)</label>
          <Input
            type="text"
            value={amount}
            onChange={handleChange}
            placeholder="Enter amount"
          />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="bg-yellow-400 text-black hover:bg-yellow-500 font-semibold"
            onClick={handleConfirm}
            disabled={mutation.status === "pending"}
          >
            {mutation.status === "pending" ? "Processing..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

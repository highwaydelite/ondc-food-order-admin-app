import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { settleSeller } from "@/utils/api";
import { formatAmount } from "@/utils/formatDate";
import { isApiError } from "@/utils/apiError";
import type { PendingSellerSettlement } from "@/pages/settlements/sellerSettlementColumns";

interface SettleSellerModalProps {
  seller: PendingSellerSettlement;
  onClose: () => void;
}

/**
 * Records a bank transfer that has already been made. The server settles every one of
 * the seller's currently-pending orders under this UTR and there is no way to undo it,
 * so the exact amount and order count are restated here before the button is armed.
 */
export function SettleSellerModal({ seller, onClose }: SettleSellerModalProps) {
  const [utrNumber, setUtrNumber] = useState("");
  const [error, setError] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: settleSeller,
    onSuccess: (response) => {
      const settled = response?.data;
      queryClient.invalidateQueries({ queryKey: ["seller-settlements"] });
      onClose();
      toast.success(
        `${formatAmount(settled?.totalAmount ?? seller.pendingAmount)} settled to ${
          settled?.sellerName || seller.sellerName
        }`
      );
    },
    onError: (err: unknown) => {
      // The modal stays open with the typed UTR intact — the transfer is already made,
      // so the reference must not be lost to a failed write.
      setError(
        (isApiError(err) && err.message) ||
          (err instanceof Error && err.message) ||
          "Could not record the settlement. Please try again."
      );

      // 400 "No pending settlement for this seller" means someone else settled it
      // first; the pending list on screen is stale.
      if (isApiError(err) && err.statusCode === 400) {
        queryClient.invalidateQueries({
          queryKey: ["seller-settlements", "pending"],
        });
      }
    },
  });

  const isSubmitting = mutation.isPending;

  const handleSubmit = () => {
    // Guards a second submit from a double click or an Enter keypress landing while
    // the first request is still in flight — this write is not idempotent.
    if (isSubmitting) return;

    const trimmed = utrNumber.trim();
    if (!trimmed) {
      setError("Enter the UTR number from the bank transfer.");
      return;
    }

    setError("");
    mutation.mutate({ sellerId: seller.sellerId, utrNumber: trimmed });
  };

  return (
    <Dialog
      open
      // Closing mid-request would leave the admin unsure whether it went through.
      onOpenChange={(next) => !next && !isSubmitting && onClose()}
    >
      <DialogContent showCloseButton={!isSubmitting}>
        <DialogHeader>
          <DialogTitle>Record settlement</DialogTitle>
          <DialogDescription>
            Use this after you have paid the seller by bank transfer.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-gray-50 p-4">
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-sm text-gray-500">Seller</span>
            <span className="font-medium">{seller.sellerName}</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between gap-4">
            <span className="text-sm text-gray-500">Orders</span>
            <span className="font-medium">{seller.orderCount ?? 0}</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between gap-4 border-t pt-2">
            <span className="text-sm text-gray-500">Amount settled</span>
            <span className="text-lg font-semibold">
              {formatAmount(seller.pendingAmount)}
            </span>
          </div>
        </div>

        <div className="flex gap-2 rounded-lg border border-yellow-300 bg-yellow-50 p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-600" />
          <p className="text-xs text-gray-700">
            This only records a payout that has already been made offline — it does not
            transfer any money. All {seller.orderCount ?? 0} pending{" "}
            {seller.orderCount === 1 ? "order" : "orders"} for this seller are settled
            under this UTR, and it cannot be undone.
          </p>
        </div>

        <div>
          <Label htmlFor="utrNumber" className="mb-2">
            UTR number
          </Label>
          <Input
            id="utrNumber"
            autoFocus
            value={utrNumber}
            onChange={(e) => setUtrNumber(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
            placeholder="e.g. UTR9988776655"
            disabled={isSubmitting}
          />
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            className="bg-yellow-400 text-black hover:bg-yellow-500 font-semibold"
            onClick={handleSubmit}
            disabled={isSubmitting || !utrNumber.trim()}
          >
            {isSubmitting ? "Recording..." : "Record settlement"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SettleSellerModal;

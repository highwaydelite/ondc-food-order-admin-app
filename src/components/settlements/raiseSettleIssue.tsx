"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";

const SUB_CATEGORIES = [
  {
    label: "Customer has not received the refund",
    value: "PMT001",
  },
  {
    label:
      "Collector NP (Buyer App) has not paid money to Receiver NP (Seller App)",
    value: "PMT002",
  },
  {
    label:
      "Collector NP (Buyer App) has not paid money to Receiver NP (Seller App) on time",
    value: "PMT003",
  },
  {
    label: "The actual payout made is less than expected",
    value: "PMT004",
  },
  {
    label: "The actual payout made is more than expected",
    value: "PMT005",
  },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: any;
  onSubmit: (payload: any) => void;
  isLoading?: boolean;
}

export function RaiseSettlementIssueDialog({
  open,
  onOpenChange,
  order,
  onSubmit,
  isLoading,
}: Props) {
  const [personName, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [subCategory, setSubCategory] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [longDesc, setLongDesc] = useState("");

  const handleSubmit = () => {
    if (!personName.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (!phone.trim()) {
      toast.error("Phone number is required");
      return;
    }
    if (!subCategory) {
      toast.error("Please select issue type");
      return;
    }
    console.log("Submit clicked", personName);

    onSubmit({
      orderId: order.id,
      category: "PTM",
      subCategory,
      name: personName,
      phone,
      email,
      providerId: order.providerId,
      fulfillmentId: order.fulfillments[0]?.fulfillmentId,
      shortDesc,
      longDesc,
      images: [],
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Raise Settlement Issue</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Name</label>
            <Input
              value={personName}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name"
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
            />
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Phone Number</label>
            <Input
              value={phone}
              onChange={(e) => {
                let v = e.target.value.replace(/\D/g, "");
                v = v.slice(0, 10);
                setPhone(v);
              }}
              placeholder="Enter 10-digit phone number"
            />
            {phone && phone.length !== 10 && (
              <p className="text-xs text-red-600">
                Enter a valid 10-digit phone number
              </p>
            )}
          </div>

          {/* Sub Category */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Issue Type</label>

            <Select value={subCategory} onValueChange={setSubCategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select issue type" />
              </SelectTrigger>

              <SelectContent className="">
                {SUB_CATEGORIES.map((item) => (
                  <SelectItem
                    key={item.value}
                    value={item.value}
                    className="whitespace-normal wrap-break-words"
                  >
                    {item.label} ({item.value})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Short Desc */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Short Description</label>
            <Input
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              placeholder="Brief description"
            />
          </div>

          {/* Long Desc */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Detailed Description</label>
            <textarea
              className="w-full border rounded-md px-3 py-2 text-sm resize-none"
              rows={4}
              value={longDesc}
              onChange={(e) => setLongDesc(e.target.value)}
              placeholder="Explain the issue in detail"
            />
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button
            disabled={
              !personName ||
              !email ||
              !phone ||
              !subCategory ||
              !shortDesc ||
              !longDesc ||
              isLoading
            }
            onClick={handleSubmit}
          >
            {isLoading ? "Submitting..." : "Raise Issue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

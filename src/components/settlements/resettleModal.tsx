import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ResettleModalProps {
  isOpen: boolean;
  id: string;
  onClose: () => void;
  onSubmit: () => void;
}

export function ResettleModal({
  id,
  isOpen,
  onClose,
  onSubmit,
}: ResettleModalProps) {
  function handleResettle() {
    onSubmit();
    onClose();
    console.log("Resettle for settlement id", id);
  }
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Resettle</DialogTitle>
        </DialogHeader>
        <div>
          <div className="grid gap-4 py-4">
            Are you sure you want to Resettle the order {id} ?
          </div>
          <DialogFooter>
            <Button onClick={handleResettle}>Resettle</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

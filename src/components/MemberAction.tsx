import { PlusCircle } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import MemberForm from "./MemberForm";
import { useRef } from "react";

const MemberAction = () => {
  const memberFormRef = useRef<HTMLButtonElement>(null);
  return (
    <div className="flex items-center justify-end gap-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button size="sm" className="h-8 gap-1">
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Add Member
            </span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Member</DialogTitle>
          </DialogHeader>
          <MemberForm
            type="CREATE"
            onClose={() => memberFormRef.current?.click()}
          />
        </DialogContent>
        <DialogClose ref={memberFormRef}></DialogClose>
      </Dialog>
    </div>
  );
};

export default MemberAction;

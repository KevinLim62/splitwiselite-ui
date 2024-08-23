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
import GroupForm from "./GroupForm";
import { useRef } from "react";

const GroupAction = () => {
  const groupFormRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="flex items-center justify-end gap-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button size="sm" className="h-8 gap-1">
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Add Group
            </span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Group</DialogTitle>
          </DialogHeader>
          <GroupForm
            type="CREATE"
            onClose={() => groupFormRef.current?.click()}
          />
        </DialogContent>
        <DialogClose ref={groupFormRef}></DialogClose>
      </Dialog>
    </div>
  );
};

export default GroupAction;

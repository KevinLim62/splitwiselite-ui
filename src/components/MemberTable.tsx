import { useMemberStore } from "@/lib/state/memberStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { MoreVertical } from "lucide-react";
import MemberForm from "./MemberForm";
import { useRef } from "react";

const MemberTable = () => {
  return (
    <Card x-chunk="dashboard-06-chunk-0">
      <CardHeader>
        <CardTitle>Members</CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <MemberListing />
      </CardContent>
    </Card>
  );
};

export default MemberTable;

const MemberListing = () => {
  const { members, deleteMember } = useMemberStore();
  const activeMembers = members.filter((members) => members.isActive);
  const memberFormRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      {activeMembers.map((member) => (
        <Card key={member.id} className="relative">
          <div className="absolute right-0">
            <Dialog>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button aria-haspopup="true" size="icon" variant="ghost">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DialogTrigger asChild>
                    <DropdownMenuItem>
                      <span>Edit</span>
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <DropdownMenuItem onClick={() => deleteMember(member.id)}>
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Member</DialogTitle>
                </DialogHeader>
                <MemberForm
                  type="UPDATE"
                  initialMemberValue={member}
                  onClose={() => memberFormRef.current?.click()}
                />
              </DialogContent>
              <DialogClose ref={memberFormRef}></DialogClose>
            </Dialog>
          </div>
          <CardHeader className="p-3 flex flex-col items-start">
            <CardTitle className="text-base">{member.name}</CardTitle>
          </CardHeader>
        </Card>
      ))}
    </>
  );
};

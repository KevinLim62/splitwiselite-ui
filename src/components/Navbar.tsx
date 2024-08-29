import { CircleDollarSign, LogIn } from "lucide-react";
import { Button } from "./ui/button";
import { useUserStore } from "@/lib/state/userStore";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import UserForm from "./UserForm";
import { useRef } from "react";

const Navbar = () => {
  const { users } = useUserStore();
  const isUserLoggedIn = users[0] ? true : false;
  const userFormRef = useRef<HTMLButtonElement>(null);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 py-2 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 sm:py-4">
      <h1 className="text-xl font-bold flex gap-2 items-center">
        <CircleDollarSign width="20" height="20" /> Split Wise Lite
      </h1>
      {isUserLoggedIn ? (
        <Avatar className="ml-auto">
          {/* <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" /> */}
          <AvatarFallback>{users[0].name.slice(0, 4)}</AvatarFallback>
        </Avatar>
      ) : (
        <div className="ml-auto">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="p-3">
                <LogIn className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>First Time Sign Up</DialogTitle>
              </DialogHeader>
              <UserForm onClose={() => userFormRef.current?.click()} />
            </DialogContent>
            <DialogClose ref={userFormRef}></DialogClose>
          </Dialog>
        </div>
      )}
    </header>
  );
};

export default Navbar;

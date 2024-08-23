import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Member, useMemberStore } from "@/lib/state/memberStore";
import { useToast } from "./ui/use-toast";

export const MemberFormSchema = z.object({
  name: z.string({
    required_error: "Member name is required",
  }),
});

type MemberFormProps = {
  type: "CREATE" | "UPDATE";
  initialMemberValue?: Member;
  onClose: () => void;
};

const MemberForm: React.FC<MemberFormProps> = ({
  type,
  initialMemberValue,
  onClose,
}) => {
  const { toast } = useToast();
  const { members, addMember, editMember } = useMemberStore();
  const form = useForm<z.infer<typeof MemberFormSchema>>({
    resolver: zodResolver(MemberFormSchema),
    defaultValues: initialMemberValue ?? {
      name: "",
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof MemberFormSchema>) {
    if (values.name === "") {
      toast({
        title: `Member name is required!`,
        variant: "destructive",
      });
      return;
    }

    switch (type) {
      case "CREATE":
        addMember({
          id: members.length + 1,
          name: values.name,
          isActive: true,
        });
        break;

      case "UPDATE":
        editMember({
          id: initialMemberValue!.id,
          name: values.name,
          isActive: true,
        });
        break;

      default:
        break;
    }

    toast({
      title: `Member - ${values.name} ${type.toLowerCase()} successfully !`,
      variant: "success",
    });

    onClose();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl className="text-base">
                <Input placeholder="Member name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};

export default MemberForm;

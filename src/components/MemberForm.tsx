import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Member, useMemberStore } from "@/lib/state/memberStore";

export const MemberFormSchema = z.object({
  name: z.string({
    required_error: "Member name is required",
  }),
});

type MemberFormProps = {
  type: "CREATE" | "UPDATE";
  initialMemberValue?: Member;
};

const MemberForm: React.FC<MemberFormProps> = ({
  type,
  initialMemberValue,
}) => {
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
      alert("Member name is required");
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
              <FormControl>
                <Input placeholder="name" {...field} />
              </FormControl>
              <FormDescription>This is display member name.</FormDescription>
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

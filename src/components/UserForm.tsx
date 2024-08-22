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
import { useUserStore } from "@/lib/state/userStore";
import { useMemberStore } from "@/lib/state/memberStore";

export const UserFormSchema = z.object({
  name: z.string({
    required_error: "User name is required",
  }),
});

const UserForm = () => {
  const { users, addUser } = useUserStore();
  const { members, addMember } = useMemberStore();
  const form = useForm<z.infer<typeof UserFormSchema>>({
    resolver: zodResolver(UserFormSchema),
    defaultValues: {
      name: "",
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof UserFormSchema>) {
    addUser({
      id: users.length + 1,
      name: values.name,
      isActive: true,
    });

    addMember({
      id: members.length + 1,
      name: values.name,
      isActive: true,
    });
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
              <FormDescription>This is your display user name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};

export default UserForm;

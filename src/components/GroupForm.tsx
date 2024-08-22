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
import { Checkbox } from "./ui/checkbox";
import { Group, useGroupStore } from "@/lib/state/groupStore";
import { useMemberStore } from "@/lib/state/memberStore";

export const groupFormSchema = z.object({
  name: z.string({
    required_error: "Group name is required",
  }),
  description: z.string().optional(),
  members: z.string().array().default([]),
});

type GroupFormProps = {
  type: "CREATE" | "UPDATE";
  initialGroupValue?: Group;
};

const GroupForm: React.FC<GroupFormProps> = ({ type, initialGroupValue }) => {
  const { groups, addGroup, editGroup } = useGroupStore();
  const { members: friends } = useMemberStore();

  const form = useForm<z.infer<typeof groupFormSchema>>({
    resolver: zodResolver(groupFormSchema),
    defaultValues: initialGroupValue ?? {
      name: "",
      description: "",
      members: [],
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof groupFormSchema>) {
    if (values.name === "") {
      alert("Group name is required");
      return;
    }

    if (friends.length === 0) {
      alert("Please select involving members");
      return;
    }

    switch (type) {
      case "CREATE":
        addGroup({
          id: groups.length + 1,
          name: values.name,
          description: values.description ?? " ",
          members: values.members,
          isActive: true,
        });
        break;

      case "UPDATE":
        editGroup({
          id: initialGroupValue!.id,
          name: values.name,
          description: values.description ?? " ",
          members: values.members,
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
              <FormDescription>
                This is your display group name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="description" {...field} />
              </FormControl>
              <FormDescription>
                This is your display group description.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="members"
          render={() => (
            <FormItem>
              <FormLabel>Friends</FormLabel>
              <FormDescription>Select the involved friends</FormDescription>
              {friends.map((friend) => (
                <FormField
                  key={friend.id}
                  control={form.control}
                  name="members"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={friend.id}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(
                              friend.id.toString()
                            )}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([
                                    ...field.value,
                                    friend.id.toString(),
                                  ])
                                : field.onChange(
                                    field.value?.filter(
                                      (value) => value !== friend.id.toString()
                                    )
                                  );
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {friend.name}
                        </FormLabel>
                      </FormItem>
                    );
                  }}
                />
              ))}
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};

export default GroupForm;

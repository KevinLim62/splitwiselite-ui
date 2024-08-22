import "./App.css";
import Navbar from "./components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import TransactionTable from "./components/TransactionTable";
import GroupTable from "./components/GroupTable";
import GroupAction from "./components/GroupAction";
import MemberTable from "./components/MemberTable";
import MemberAction from "./components/MemberAction";
import TransactionAction from "./components/TransactionAction";

function App() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Navbar />
      <main className="grid flex-1 items-start gap-4 p-4 py-5 sm:px-6 md:gap-8">
        <Tabs defaultValue="group">
          <div className="flex items-center">
            <TabsList>
              <TabsTrigger value="group">Group</TabsTrigger>
              <TabsTrigger value="transaction">Transaction</TabsTrigger>
              <TabsTrigger value="member">Member</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="group" className="space-y-5">
            <GroupAction />
            <GroupTable />
          </TabsContent>
          <TabsContent value="transaction" className="space-y-5">
            <TransactionAction />
            <TransactionTable />
          </TabsContent>
          <TabsContent value="member" className="space-y-5">
            <MemberAction />
            <MemberTable />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default App;

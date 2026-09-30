import { UserProvider } from "@/context/UserContext";
import { MainAppContainer } from "@/components/MainAppContainer";

export default function Home() {
  return (
    <UserProvider>
      <MainAppContainer />
    </UserProvider>
  );
}

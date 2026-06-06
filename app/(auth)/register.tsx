import { router } from "expo-router";
import RegisterScreen from "../../src/screens/RegisterScreen";

export default function RegisterPage() {
  return (
    <RegisterScreen
      onRegister={async () => {}}
      onNavigateToLogin={() => router.push("/login" as any)}
    />
  );
}
import LeftPanel from "./LeftPanel";
import RegisterForm from "./RegisterForm";

function AuthLayout() {
  return (
    <div className="min-h-screen w-full bg-[#030712] grid md:grid-cols-[38%_62%] overflow-hidden relative">
      <LeftPanel />
      <RegisterForm />
    </div>
  );
}

export default AuthLayout;
import React from "react";
import Link from "next/link";

const Login = () => {
  return (
    <main className="h-screen">
      <div>
        <Link href="/login">Login</Link>
      </div>
      <div>
        <Link href="/signup">Sign Up</Link>
      </div>
    </main>
  );
};

export default Login;

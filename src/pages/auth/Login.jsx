import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAuth } from "../../context/AuthContext";
import { Eye, EyeOff, LogIn } from "lucide-react";

const schema = yup.object({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
});

const Login = () => {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    await login(data.email, data.password);
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8">
      <div className="text-center mb-8">
        <img
          src="/Mahavaylogo.png"
          alt="Mahavay CRM"
          className="w-16 h-16 rounded-2xl object-contain mx-auto mb-4"
        />
        <h1 className="text-2xl font-bold text-secondary-900">Welcome Back</h1>
        <p className="text-secondary-500 mt-1">Sign in to Mahavay CRM</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="label">Email Address</label>
          <input
            type="email"
            {...register("email")}
            className={`input ${errors.email ? "input-error" : ""}`}
            placeholder="Enter your email"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="label">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              {...register("password")}
              className={`input pr-10 ${errors.password ? "input-error" : ""}`}
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Signing in...
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <LogIn className="w-5 h-5" />
              Sign In
            </div>
          )}
        </button>
      </form>

      <div className="mt-6 p-4 bg-secondary-50 rounded-lg">
        <p className="text-xs text-secondary-500 text-center"></p>
      </div>
    </div>
  );
};

export default Login;

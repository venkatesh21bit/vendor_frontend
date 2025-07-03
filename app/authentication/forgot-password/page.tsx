"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"verify" | "otp" | "reset">("verify");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && email) {
      setStep("otp");
      setError("");
      // In a real application, you would make an API call here to send OTP to user's email
    } else {
      setError("Please enter both username and email.");
    }
  };

  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      setError("Please enter the OTP.");
      return;
    }
    setStep("reset");
    setError("");
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setError("Please fill in both password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(" Passwords do not match.");
      return;
    }
    alert("Password reseted successful!");
    setError("");
    // Navigate to login page after successful password reset
    setTimeout(() => {
      router.push("/authentication");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <Card className="bg-black text-white border border-white-300 w-full md:w-96">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {step === "verify" && "Forgot Password"}
            {step === "otp" && "Verify OTP"}
            {step === "reset" && "Reset Password"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {step === "verify" && (
            <form onSubmit={handleVerify} className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  className="bg-gray-900 text-white border border-gray-700"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="bg-gray-900 text-white border border-gray-700"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Get OTP
              </Button>
            </form>
          )}
          {step === "otp" && (
            <form onSubmit={handleOtpVerify} className="flex flex-col gap-6">
              <div className="text-center mb-4">
                <p className="text-gray-400 text-sm">
                  We've sent a OTP to your email address
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter your OTP"
                  className="bg-gray-900 text-white border border-gray-700 text-center text-lg tracking-widest"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Verify OTP
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full border-gray-700 text-gray-400 hover:bg-gray-800"
                onClick={() => setStep("verify")}
              >
                Back
              </Button>
            </form>
          )}
          {step === "reset" && (
            <form onSubmit={handleReset} className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Enter new password"
                  className="bg-gray-900 text-white border border-gray-700"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm new password"
                  className="bg-gray-900 text-white border border-gray-700"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Reset Password
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full border-gray-700 text-gray-400 hover:bg-gray-800"
                onClick={() => setStep("otp")}
              >
                Back
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 

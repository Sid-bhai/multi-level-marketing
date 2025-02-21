import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, InsertUser } from "@shared/schema";
import { Redirect } from "wouter";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

function generateUsernameSuggestions(username: string): string[] {
  const suggestions = [];
  if (username.length >= 3) {
    suggestions.push(
      `${username}123`,
      `${username}_${Math.floor(Math.random() * 999)}`,
      `${username}${Math.floor(Math.random() * 999)}`,
      `${username}_user`
    );
  }
  return suggestions;
}

function calculatePasswordStrength(password: string): number {
  let strength = 0;
  if (password.length >= 8) strength += 25;
  if (password.match(/[A-Z]/)) strength += 25;
  if (password.match(/[0-9]/)) strength += 25;
  if (password.match(/[^A-Za-z0-9]/)) strength += 25;
  return strength;
}

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [usernameAvailable, setUsernameAvailable] = useState(true);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [uniqueFieldErrors, setUniqueFieldErrors] = useState<{
    email?: string;
    phone?: string;
  }>({});
  const [, params] = useLocation();

  const urlParams = new URLSearchParams(window.location.search);
  const referralCode = urlParams.get('ref');

  const loginForm = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema.pick({ username: true, password: true })),
    defaultValues: {
      username: "",
      password: "",
    }
  });

  const registerForm = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
      fullName: "",
      email: "",
      phone: "",
      state: "",
      referralCode: referralCode || "",
    }
  });

  const checkUnique = async (field: string, value: string) => {
    try {
      const res = await fetch(`/api/check-unique?field=${field}&value=${encodeURIComponent(value)}`);
      const data = await res.json();
      if (!data.available) {
        setUniqueFieldErrors(prev => ({
          ...prev,
          [field]: `This ${field} is already registered`
        }));
      } else {
        setUniqueFieldErrors(prev => ({
          ...prev,
          [field]: undefined
        }));
      }
    } catch (error) {
      console.error(`Failed to check ${field}:`, error);
    }
  };

  const checkUsername = async (username: string) => {
    if (username.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await fetch(`/api/check-username?username=${encodeURIComponent(username)}`);
      const data = await res.json();
      setUsernameAvailable(data.available);
      if (!data.available) {
        setSuggestions(generateUsernameSuggestions(username));
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Failed to check username:", error);
    }
  };

  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 p-8 flex items-center justify-center">
        <Tabs defaultValue="login" className="w-full max-w-md">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Welcome Back</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit((data) => loginMutation.mutate(data))}
                    className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                      {loginMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Login
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Create Account</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit((data) => registerMutation.mutate(data))}
                    className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input {...field} onChange={e => {
                              field.onChange(e);
                              checkUsername(e.target.value);
                            }} />
                          </FormControl>
                          {!usernameAvailable && (
                            <div className="space-y-2">
                              <p className="text-sm text-red-500">Username is already taken</p>
                              {suggestions.length > 0 && (
                                <div className="text-sm">
                                  <p className="font-medium">Suggestions:</p>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {suggestions.map((suggestion) => (
                                      <Button
                                        key={suggestion}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          registerForm.setValue("username", suggestion);
                                          checkUsername(suggestion);
                                        }}
                                      >
                                        {suggestion}
                                      </Button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              {...field}
                              onChange={e => {
                                field.onChange(e);
                                checkUnique('email', e.target.value);
                              }}
                            />
                          </FormControl>
                          {uniqueFieldErrors.email && (
                            <p className="text-sm text-red-500">{uniqueFieldErrors.email}</p>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              onChange={e => {
                                field.onChange(e);
                                checkUnique('phone', e.target.value);
                              }}
                            />
                          </FormControl>
                          {uniqueFieldErrors.phone && (
                            <p className="text-sm text-red-500">{uniqueFieldErrors.phone}</p>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              {...field}
                              onChange={e => {
                                field.onChange(e);
                                setPasswordStrength(calculatePasswordStrength(e.target.value));
                              }}
                            />
                          </FormControl>
                          <div className="space-y-2">
                            <Progress value={passwordStrength} className="h-2" />
                            <FormDescription>
                              Password strength: {
                                passwordStrength <= 25 ? "Weak" :
                                  passwordStrength <= 50 ? "Fair" :
                                    passwordStrength <= 75 ? "Good" :
                                      "Strong"
                              }
                            </FormDescription>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="referralCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Referral Code {referralCode && '(Auto-filled)'}</FormLabel>
                          <FormControl>
                            <Input {...field} readOnly={!!referralCode} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                      {registerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Register
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <div className="hidden lg:flex flex-1 bg-primary items-center justify-center text-white p-8">
        <div className="max-w-lg">
          <h1 className="text-4xl font-bold mb-4">Join Our Network Marketing Platform</h1>
          <p className="text-lg opacity-90">
            Start your journey to financial freedom with our proven MLM system.
            Build your team, earn commissions, and achieve your dreams.
          </p>
        </div>
      </div>
    </div>
  );
}
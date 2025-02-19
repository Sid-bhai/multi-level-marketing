import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { SiGoogle } from "react-icons/si";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  state: z.string().min(1, "State is required"),
  referredBy: z.string().optional(),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const debouncedUsername = useDebounce(username, 500);

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      phone: "",
      state: "",
      referredBy: "",
    },
  });

  // Check username availability
  useEffect(() => {
    if (debouncedUsername.length >= 3) {
      fetch(`/api/check-username/${debouncedUsername}`)
        .then((res) => res.json())
        .then((data) => {
          setUsernameAvailable(data.available);
          setSuggestions(data.suggestions || []);
        });
    } else {
      setUsernameAvailable(null);
      setSuggestions([]);
    }
  }, [debouncedUsername]);

  // Auto-fill referral code from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      form.setValue("referredBy", ref);
    }
  }, []);

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const firebaseUser = userCredential.user;

      // Register user in our backend
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          firebaseUid: firebaseUser.uid,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed");
      }

      const userData = await response.json();
      toast({
        title: "Success",
        description: "Successfully registered! Welcome to our platform.",
      });

      // Show notification toast
      toast({
        title: "New Notification",
        description: "You have a welcome message in your notifications!",
      });

      navigate("/dashboard");
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });

      // If backend registration failed, delete Firebase user
      if (auth.currentUser) {
        await auth.currentUser.delete();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Register with backend using Google profile
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: user.displayName,
          email: user.email,
          username: user.email?.split('@')[0] || '',
          password: Math.random().toString(36).slice(-8), // Generate random password
          phone: "",
          state: "",
          firebaseUid: user.uid,
          photoURL: user.photoURL,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed");
      }

      toast({
        title: "Success",
        description: "Successfully registered with Google!",
      });

      navigate("/dashboard");
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Register</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
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
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          setUsername(e.target.value);
                        }}
                      />
                    </FormControl>
                    {usernameAvailable === false && (
                      <div className="text-sm text-destructive">
                        Username taken. Try these instead:
                        <div className="flex gap-2 mt-1">
                          {suggestions.map((suggestion) => (
                            <Button
                              key={suggestion}
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                form.setValue("username", suggestion);
                                setUsername(suggestion);
                              }}
                            >
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                    {usernameAvailable === true && (
                      <div className="text-sm text-green-600">
                        Username available!
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          {...field}
                          autoComplete="new-password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
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
                control={form.control}
                name="referredBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Referral Code (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Register"
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              type="button"
              className="w-full mt-4"
              onClick={handleGoogleSignIn}
            >
              <SiGoogle className="mr-2 h-4 w-4" />
              Google
            </Button>

            <p className="text-center text-sm text-muted-foreground mt-4">
              Already have an account?{" "}
              <Button
                variant="link"
                className="p-0"
                onClick={() => navigate("/login")}
              >
                Login
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
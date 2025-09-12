import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

const cleanupAuthState = () => {
  localStorage.removeItem("supabase.auth.token");
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith("supabase.auth.") || key.includes("sb-")) {
      localStorage.removeItem(key);
    }
  });
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith("supabase.auth.") || key.includes("sb-")) {
      sessionStorage.removeItem(key);
    }
  });
};

const AuthPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [signInData, setSignInData] = useState({ email: "", password: "" });
  const [signUpData, setSignUpData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    displayName: "",
    phone: "",
  });

  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Clean up existing state
      cleanupAuthState();

      // Attempt global sign out
      try {
        await supabase.auth.signOut({ scope: "global" });
      } catch (err) {
        // Continue even if this fails
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: signInData.email,
        password: signInData.password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          throw new Error(
            "Email ou senha incorretos. Verifique suas credenciais."
          );
        }
        throw error;
      }

      if (data.user) {
        toast({
          title: "Sucesso!",
          description: "Login realizado com sucesso.",
        });
        window.location.href = "/";
      }
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message || "Ocorreu um erro ao fazer login.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!signInData.email) {
      toast({
        title: "Email necessário",
        description: "Digite seu email para recuperar a senha.",
        variant: "destructive",
      });
      return;
    }

    setResetLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        signInData.email,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (error) throw error;

      toast({
        title: "Email enviado!",
        description: "Verifique seu email para redefinir sua senha.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao enviar o email.",
        variant: "destructive",
      });
    } finally {
      setResetLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (signUpData.password !== signUpData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    if (signUpData.password.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Clean up existing state
      cleanupAuthState();

      // Attempt global sign out
      try {
        await supabase.auth.signOut({ scope: "global" });
      } catch (err) {
        // Continue even if this fails
      }

      const redirectUrl = `${window.location.origin}/`;

      const { data, error } = await supabase.auth.signUp({
        email: signUpData.email,
        password: signUpData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            display_name: signUpData.displayName,
            phone: signUpData.phone,
          },
        },
      });

      if (error) {
        if (error.message.includes("User already registered")) {
          throw new Error("Este email já está cadastrado. Tente fazer login.");
        }
        throw error;
      }

      if (data.user) {
        // Create profile
        const { error: profileError } = await supabase.from("profiles").insert({
          user_id: data.user.id,
          display_name: signUpData.displayName || null,
          phone: signUpData.phone || null,
        });

        if (profileError) {
          console.error("Error creating profile:", profileError);
        }

        toast({
          title: "Cadastro realizado!",
          description: "Verifique seu email para confirmar sua conta.",
        });

        // Clear form
        setSignUpData({
          email: "",
          password: "",
          confirmPassword: "",
          displayName: "",
          phone: "",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro no cadastro",
        description: error.message || "Ocorreu um erro ao criar sua conta.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao início
          </Link>
        </div>

        <Card className="bg-white/95 backdrop-blur border-0 shadow-elegant">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <CardTitle className="text-2xl font-bold">Beauty Clinic</CardTitle>
            <CardDescription>
              Entre em sua conta ou crie uma nova
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Cadastrar</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      value={signInData.email}
                      onChange={(e) =>
                        setSignInData({ ...signInData, email: e.target.value })
                      }
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Senha</Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        type={showPassword ? "text" : "password"}
                        value={signInData.password}
                        onChange={(e) =>
                          setSignInData({
                            ...signInData,
                            password: e.target.value,
                          })
                        }
                        placeholder="Sua senha"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? "Entrando..." : "Entrar"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full mt-2"
                    onClick={handleForgotPassword}
                    disabled={resetLoading}
                  >
                    {resetLoading ? "Enviando..." : "Esqueci minha senha"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Nome</Label>
                    <Input
                      id="signup-name"
                      value={signUpData.displayName}
                      onChange={(e) =>
                        setSignUpData({
                          ...signUpData,
                          displayName: e.target.value,
                        })
                      }
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">Telefone </Label>
                    <Input
                      id="signup-phone"
                      value={signUpData.phone}
                      onChange={(e) =>
                        setSignUpData({ ...signUpData, phone: e.target.value })
                      }
                      placeholder="(11) 99999-9999"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={signUpData.email}
                      onChange={(e) =>
                        setSignUpData({ ...signUpData, email: e.target.value })
                      }
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Senha</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        value={signUpData.password}
                        onChange={(e) =>
                          setSignUpData({
                            ...signUpData,
                            password: e.target.value,
                          })
                        }
                        placeholder="Mínimo 6 caracteres"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password">
                      Confirmar Senha
                    </Label>
                    <Input
                      id="signup-confirm-password"
                      type={showPassword ? "text" : "password"}
                      value={signUpData.confirmPassword}
                      onChange={(e) =>
                        setSignUpData({
                          ...signUpData,
                          confirmPassword: e.target.value,
                        })
                      }
                      placeholder="Confirme sua senha"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? "Criando conta..." : "Criar conta"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;

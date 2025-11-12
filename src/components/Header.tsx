import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, LogOut, User, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import logo from "../assets/logo.png";
import { supabase } from "@/integrations/supabase/client";
import { CartDrawer } from "./CartDrawer";
const studioId = import.meta.env.VITE_STUDIO_ID;
const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const [profile, setProfile] = useState<{
    display_name?: string;
    avatar_url?: string;
  } | null>(null);
  const handleSignOut = async () => {
    await signOut();
  };

  const handleScheduleClick = () => {
    if (user) {
      navigate("/agendamento");
    } else {
      navigate("/auth");
    }
    setMobileMenuOpen(false);
  };
  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user?.id)
        .eq("studio_id", studioId)
        .maybeSingle();
      if (error) throw error;
      if (data) {
        setProfile({
          display_name: data.display_name || null,
          avatar_url: (data as any).avatar_url || null,
        });
      }
    } catch (error) {
      console.error("Erro ao buscar perfil:", error);
    }
  };

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const navItems = [
    { label: "Início", href: "inicio" },
    { label: "Serviços", href: "servicos" },
    { label: "Resultados", href: "resultados" },
    { label: "Sobre o studio", href: "sobre" },
  ];

  const handleNavClick = (href: string) => {
    if (location.pathname === "/") {
      // Está na Home, rola direto
      const section = document.getElementById(href);
      section?.scrollIntoView({ behavior: "smooth" });
    } else {
      // Navega para a Home e passa o destino via state
      navigate("/", { state: { scrollToId: href } });
    }

    setMobileMenuOpen(false);
  };
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-foreground text-background border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img
              src={logo}
              alt="Lariza Freitas"
              className="h-32 md:h-40 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNavClick(item.href)}
                style={{ color: "#D4AF37" }} // cor dourada
                className="hover:text-yellow-500 transition-colors"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <CartDrawer />
            <Button
              variant="outline"
              onClick={handleScheduleClick}
              className="group"
              style={{ color: "#D4AF37", borderColor: "#D4AF37" }} // texto e borda dourada
            >
              <Calendar
                className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform"
                style={{ color: "#D4AF37" }} // ícone dourado
              />
              Agendar
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar>
                      {profile?.avatar_url ? (
                        <AvatarImage
                          src={profile.avatar_url}
                          alt="Foto do usuário"
                        />
                      ) : (
                        <AvatarFallback>
                          {profile?.display_name?.[0] || "U"}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="px-2 py-1.5 text-sm font-normal">
                    <div className="font-medium">{user.email}</div>
                    <div className="text-xs text-muted-foreground">
                      Usuário logado
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/perfil")}>
                    <User className="mr-2 h-4 w-4" />
                    Meu Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/perfil")}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Meus Agendamentos
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                style={{ backgroundColor: "#D4AF37", color: "#ffffffff" }}
                onClick={() => navigate("/auth")}
              >
                Entrar
              </Button>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="md:hidden flex items-center gap-2">
            <CartDrawer />
            <Button
              variant="ghost"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => handleNavClick(item.href)}
                  className="block px-3 py-2 text-base text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </button>
              ))}

              <div className="px-3 py-2 space-y-2">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <CartDrawer />
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleScheduleClick}
                    className="flex-1"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Agendar
                  </Button>
                </div>

                {user ? (
                  <div className="space-y-2">
                    <div className="px-3 py-2 text-sm">
                      <div className="font-medium">{user.email}</div>
                      <div className="text-xs text-muted-foreground">
                        Usuário logado
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        navigate("/perfil");
                        setMobileMenuOpen(false);
                      }}
                      className="w-full justify-start w-full justify-start text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Meu Perfil
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        navigate("/perfil");
                        setMobileMenuOpen(false);
                      }}
                      className="w-full justify-start w-full justify-start text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Meus Agendamentos
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={handleSignOut}
                      className="w-full justify-start w-full justify-start text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sair
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="primary"
                    onClick={() => {
                      navigate("/auth");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full"
                  >
                    Entrar
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

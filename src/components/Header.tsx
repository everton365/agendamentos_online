import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Calendar, LogOut, User, Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleScheduleClick = () => {
    if (user) {
      navigate('/agendamento');
    } else {
      navigate('/auth');
    }
    setMobileMenuOpen(false);
  };

  const navItems = [
    { label: 'Início', href: '/' },
    { label: 'Serviços', href: '/#servicos' },
    { label: 'Resultados', href: '/#resultados' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <span className="font-bold text-xl text-foreground">Beauty Clinic</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={handleScheduleClick}
              className="group"
            >
              <Calendar className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
              Agendar
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-primary text-white">
                        {user.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
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
                  <DropdownMenuItem onClick={() => navigate('/agendamento')}>
                    <User className="mr-2 h-4 w-4" />
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
              <Button variant="primary" onClick={() => navigate('/auth')}>
                Entrar
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className="block px-3 py-2 text-base text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              
              <div className="px-3 py-2 space-y-2">
                <Button 
                  variant="outline" 
                  onClick={handleScheduleClick}
                  className="w-full justify-start"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Agendar
                </Button>

                {user ? (
                  <div className="space-y-2">
                    <div className="px-3 py-2 text-sm">
                      <div className="font-medium">{user.email}</div>
                      <div className="text-xs text-muted-foreground">Usuário logado</div>
                    </div>
                    <Button 
                      variant="ghost" 
                      onClick={() => {
                        navigate('/agendamento');
                        setMobileMenuOpen(false);
                      }}
                      className="w-full justify-start"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Meus Agendamentos
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={handleSignOut}
                      className="w-full justify-start"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sair
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="primary" 
                    onClick={() => {
                      navigate('/auth');
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

import React from 'react';
import { NavLink } from 'react-router-dom';
import { Users, LayoutDashboard } from 'lucide-react';

const Navigation: React.FC = () => {
  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-border/40 shadow-subtle">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold">Mitarbeiterverwaltung</h1>
        </div>
        
        <nav className="flex items-center space-x-2">
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              `group px-4 py-2 rounded-full flex items-center space-x-2 transition-all duration-300 ${
                isActive 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:bg-accent'
              }`
            }
            end
          >
            <Users className="h-4 w-4" />
            <span>Mitarbeiter</span>
          </NavLink>
          
          <NavLink 
            to="/departments" 
            className={({ isActive }) => 
              `group px-4 py-2 rounded-full flex items-center space-x-2 transition-all duration-300 ${
                isActive 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:bg-accent'
              }`
            }
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Abteilungen</span>
          </NavLink>
        </nav>
      </div>
    </header>
  );
};

export default Navigation;

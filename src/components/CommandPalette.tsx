import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Home, BookOpen, FileText, Mail, User, Shield, LogOut, Sun, Moon,
  Sparkles, Trophy, MessageSquare,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onOpenChat?: () => void;
}

const CommandPalette = ({ open, onOpenChange, onOpenChat }: Props) => {
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const go = (path: string) => { navigate(path); onOpenChange(false); };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => go('/')}><Home className="mr-2 h-4 w-4" />Home</CommandItem>
          <CommandItem onSelect={() => go('/courses')}><BookOpen className="mr-2 h-4 w-4" />Courses</CommandItem>
          <CommandItem onSelect={() => go('/blog')}><FileText className="mr-2 h-4 w-4" />Blog</CommandItem>
          <CommandItem onSelect={() => go('/contact')}><Mail className="mr-2 h-4 w-4" />Contact</CommandItem>
        </CommandGroup>
        {user && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Account">
              <CommandItem onSelect={() => go('/profile')}><User className="mr-2 h-4 w-4" />My Profile</CommandItem>
              <CommandItem onSelect={() => go('/leaderboard')}><Trophy className="mr-2 h-4 w-4" />Leaderboard</CommandItem>
              {isAdmin && (
                <CommandItem onSelect={() => go('/dashboard')}><Shield className="mr-2 h-4 w-4" />Admin Dashboard</CommandItem>
              )}
              <CommandItem onSelect={() => { signOut(); onOpenChange(false); }}>
                <LogOut className="mr-2 h-4 w-4" />Sign Out
              </CommandItem>
            </CommandGroup>
          </>
        )}
        <CommandSeparator />
        <CommandGroup heading="Actions">
          {onOpenChat && (
            <CommandItem onSelect={() => { onOpenChat(); onOpenChange(false); }}>
              <MessageSquare className="mr-2 h-4 w-4" />Open AI Assistant
            </CommandItem>
          )}
          <CommandItem onSelect={() => { toggleTheme(); onOpenChange(false); }}>
            {theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
            Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
          </CommandItem>
          <CommandItem><Sparkles className="mr-2 h-4 w-4" />ABD"I Premium</CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};

export default CommandPalette;

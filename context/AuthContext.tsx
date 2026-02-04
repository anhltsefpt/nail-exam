import * as AppleAuthentication from 'expo-apple-authentication';
import React, { createContext, useContext, useState } from 'react';

interface AuthContextType {
    user: AppleAuthentication.AppleAuthenticationCredential | null;
    signIn: (credential: AppleAuthentication.AppleAuthenticationCredential) => void;
    signOut: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AppleAuthentication.AppleAuthenticationCredential | null>(null);

    const signIn = (credential: AppleAuthentication.AppleAuthenticationCredential) => {
        setUser(credential);
        // TODO: Persist user session securely
    };

    const signOut = () => {
        setUser(null);
        // TODO: Clear persisted session
    };

    return (
        <AuthContext.Provider value={{ user, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

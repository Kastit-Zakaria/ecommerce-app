import { createContext } from 'react';

// Objet de contexte partagé entre AuthProvider (qui le remplit) et useAuth (qui le lit)
const AuthContext = createContext(null);

export default AuthContext;

import React from 'react';

const dispatchUserSessionAction = jest.fn();

const initialState = {
  status: 'loggedIn',
  data: null,
};

export const useUserSession = jest.fn().mockReturnValue([initialState, dispatchUserSessionAction]);

const UserSessionContext = React.createContext<[typeof initialState, () => void] | undefined>(undefined);

export const UserSessionProvider: React.FC = ({ children }) => {
  return (
    <UserSessionContext.Provider value={[initialState, dispatchUserSessionAction]}>
      {children}
    </UserSessionContext.Provider>
  );
};

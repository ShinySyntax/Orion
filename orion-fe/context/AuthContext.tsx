import React, { useState, useContext, useEffect } from 'react';

import setupAxios from '../utils/axios';
import { IUserData } from '../utils/interface';
import { message } from 'antd';

const UserContext = React.createContext({});
const UserUpdateContext = React.createContext({});

export const useAuth = () => useContext<any>(UserContext);
export const useAuthUpdate = () => useContext<any>(UserUpdateContext);

export const AuthProvider = ({
  token: initialToken,
  userData,
  children,
}: any) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [user, setUser] = useState<IUserData>(userData);
  const [token, setToken] = useState<string>(initialToken);
  const axios = setupAxios({ accessToken: initialToken, baseURL: 'api' });

  useEffect(() => {
    setUser(userData);
  }, [userData]);

  return (
    <UserContext.Provider value={{ user, axios, token, messageApi }}>
      <UserUpdateContext.Provider value={{ setUser }}>
        {contextHolder}
        {children}
      </UserUpdateContext.Provider>
    </UserContext.Provider>
  );
};

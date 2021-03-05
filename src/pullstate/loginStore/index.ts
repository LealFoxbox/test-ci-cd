import { Store } from 'pullstate';

import { fetchtUser } from 'src/services/api/user';
import { axiosCatchTo } from 'src/utils/catchTo';

import { initStoreStorage } from '../storeStorage';
import { loginAction, logoutAction } from '../actions';

import { LoginState, initialState } from './initialState';

export const LoginStore = new Store(initialState);

const { restoreStoredData, subscribe } = initStoreStorage({ storeName: 'loginStore', store: LoginStore, initialState });

void restoreStoredData().then(async (state: LoginState) => {
  if (!state.userData) {
    void logoutAction();
  } else {
    const companyId = state.userData.account.subdomain;
    const token = state.userData.single_access_token;
    // refetch user
    const [error, response] = await axiosCatchTo(() =>
      fetchtUser({
        companyId,
        token,
      }),
    );

    if (error || !response) {
      console.warn('fetchtUser error ', error);
      if (error?.response?.status === 401) {
        void logoutAction();
      } else {
        void loginAction(state.userData);
      }
    } else {
      if (response.data) {
        void loginAction(response.data.user);
      } else {
        void loginAction(state.userData);
      }
    }
  }
});

subscribe();
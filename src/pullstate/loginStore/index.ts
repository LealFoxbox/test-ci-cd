import { Store } from 'pullstate';
import { fromPairs } from 'lodash/fp';

import { fetchtUser } from 'src/services/api/user';
import { axiosCatchTo } from 'src/utils/catchTo';

import { OldState, initStoreStorage } from '../storeStorage';
import { clearInspectionsDataAction, loginAction, logoutAction } from '../actions';

import { LoginState, initialState } from './initialState';

export const LoginStore = new Store(initialState);

const reconcileState = (iState: LoginState, oldState: OldState) => {
  // So far, we don't really need to migrate a lot of info between versions
  // but just in case we are carefully restoring just what we know is correct in the current state
  return fromPairs(Object.entries(iState).map(([key, value]) => [key, oldState[key] || value])) as LoginState;
};

const { restoreStoredData, subscribe } = initStoreStorage({ storeName: 'loginStore', store: LoginStore, initialState });

void restoreStoredData(reconcileState).then(async (state: LoginState) => {
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

    if (!error && response?.data) {
      void loginAction({ user: response.data.user, outdatedUserData: false });
    } else {
      console.warn('fetchtUser error ', error);

      if (error?.response?.status === 401) {
        void logoutAction();
      } else {
        await loginAction({ user: state.userData });
        if (state.outdatedUserData) {
          await clearInspectionsDataAction({
            invalidateUserData: true,
            companyId,
            token,
          });
        }
      }
    }
  }
});

subscribe();

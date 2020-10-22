export const SIGN_IN = 'SIGN_IN';
export const MAIN_STACK_NAVIGATOR = 'MAIN_STACK_NAVIGATOR';
export const MAIN_TABS_NAVIGATOR = 'MAIN_TABS_NAVIGATOR';
export const INSPECTIONS_NAVIGATOR = 'INSPECTIONS_NAVIGATOR';
export const SCHEDULED_NAVIGATOR = 'SCHEDULED_NAVIGATOR';
export const TICKETS_NAVIGATOR = 'TICKETS_NAVIGATOR';
export const ACCOUNT_NAVIGATOR = 'ACCOUNT_NAVIGATOR';
export const INSPECTIONS_HOME = 'INSPECTIONS_HOME';
export const SCHEDULED_HOME = 'SCHEDULED_HOME';
export const TICKETS_HOME = 'TICKETS_HOME';
export const ACCOUNT_HOME = 'ACCOUNT_HOME';

// This type is a fix for adding nested navigators https://github.com/react-navigation/react-navigation/issues/6931#issuecomment-643392469
export type NestedNavigatorParams<ParamList> = {
  [K in keyof ParamList]: undefined extends ParamList[K]
    ? { screen: K; params?: ParamList[K] }
    : { screen: K; params: ParamList[K] };
}[keyof ParamList];

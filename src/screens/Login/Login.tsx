import React, { useEffect, useState } from 'react';
import { TextInput as NativeTextInput, TouchableWithoutFeedback } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { useMutation } from 'react-query';
import { AxiosResponse } from 'axios';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { RouteProp, useRoute } from '@react-navigation/native';

import ErrorMessage from 'src/components/ErrorMessage';
import { ScrollView } from 'src/components/KeyboardAware';
import ConnectionBanner from 'src/components/ConnectionBanner';
import { UserResponse, authenticate } from 'src/services/api/user';
import config from 'src/config';
import { useNetworkStatus } from 'src/utils/useNetworkStatus';
import { SIGN_IN } from 'src/navigation/screenNames';
import { AuthNavigatorParamList } from 'src/navigation/AuthNavigator';
import { PersistentUserStore, loginAction, setStagingAction } from 'src/pullstate/persistentStore';
import { ApiError } from 'src/services/api/utils';

import StagingDialog from './StagingDialog';
import { EasterEgg, FormContainer } from './styles';

interface Form {
  companyId: string;
  username: string;
  password: string;
}

const SignInSchema = Yup.object().shape({
  companyId: Yup.string().required(`Please enter your Account Name.`),
  username: Yup.string().required(`Please provide your Email/Username.`),
  password: Yup.string().required(`Please enter your password.`),
});

const authenticateError = 'Your username or password appears to be incorrect for this account';

const LoginScreen: React.FC<{}> = () => {
  const isStaging = PersistentUserStore.useState((s) => s.isStaging);
  const [authError, setAuthError] = useState('');
  const connected = useNetworkStatus();
  const [visible, setVisible] = React.useState(false);
  const {
    params: { updateRenderRight },
  } = useRoute<RouteProp<AuthNavigatorParamList, typeof SIGN_IN>>();

  const [mutateSubmit, { isLoading }] = useMutation<AxiosResponse<UserResponse>, ApiError, Form>(authenticate, {
    onMutate: () => {
      setAuthError('');
    },
    onSuccess: (userData) => {
      if (userData.status === 200 && userData.data.user) {
        setAuthError('');
        setStagingAction(isStaging);
        loginAction(userData.data.user);
      } else {
        setAuthError(authenticateError);
      }
    },
    onError: (err) => {
      if (err?.message !== 'Network Error') {
        setAuthError(err?.response?.data.message || authenticateError);
      } else if (connected) {
        // TODO: check if we should use another custom error
        setAuthError(authenticateError);
      }
    },
  });

  useEffect(() => {
    updateRenderRight(() => (
      <TouchableWithoutFeedback delayLongPress={4000} accessibilityRole="none" onLongPress={() => setVisible(true)}>
        <EasterEgg />
      </TouchableWithoutFeedback>
    ));
  }, [updateRenderRight, setVisible]);

  const handleEasterEgg = () => {
    if (!isLoading) {
      setAuthError('');

      if (isStaging) {
        PersistentUserStore.update((s) => (s.isStaging = false));
      } else {
        PersistentUserStore.update((s) => (s.isStaging = true));
      }
    }
  };

  const clearError = <T extends string | React.ChangeEvent<any>>(onChange: (e: T) => void) => {
    return (e: T) => {
      setAuthError('');
      onChange(e);
    };
  };

  return (
    <ScrollView>
      <ConnectionBanner connected={connected} />
      <Formik
        initialValues={{
          companyId: config.isDev ? 'foxbox' : '',
          username: config.isDev ? 'diego' : '',
          password: config.isDev ? 'foxbox2020' : '',
        }}
        validationSchema={SignInSchema}
        onSubmit={(form) => mutateSubmit(form)}
      >
        {({ values, handleChange, errors, setFieldTouched, touched, isValid, handleSubmit }) => (
          <FormContainer>
            <TextInput
              value={values.companyId}
              onChangeText={clearError(handleChange('companyId'))}
              onBlur={() => setFieldTouched('companyId')}
              style={{ marginBottom: 10, textAlign: 'right' }}
              keyboardType="default"
              autoCapitalize="none"
              dense
              right={<TextInput.Affix text={`.${config.BACKEND_BASE_URL}`} />}
              /* @ts-ignore */
              render={(props) => <NativeTextInput {...props} textAlign="right" />}
              label="Account Name"
              disabled={isLoading}
              error={touched.companyId && !!errors.companyId}
            />
            {touched.companyId && errors.companyId && <ErrorMessage>{errors.companyId}</ErrorMessage>}
            <TextInput
              value={values.username}
              onChangeText={clearError(handleChange('username'))}
              onBlur={() => setFieldTouched('username')}
              style={{ marginBottom: 10 }}
              keyboardType="default"
              autoCapitalize="none"
              dense
              label="Email or Username"
              disabled={isLoading}
              error={touched.username && !!errors.username}
            />
            {touched.username && errors.username && <ErrorMessage>{errors.username}</ErrorMessage>}
            <TextInput
              value={values.password}
              onChangeText={clearError(handleChange('password'))}
              style={{ marginBottom: 10 }}
              keyboardType="default"
              autoCapitalize="none"
              dense
              autoCorrect={false}
              label="Password"
              onBlur={() => setFieldTouched('password')}
              secureTextEntry
              disabled={isLoading}
              onSubmitEditing={() => {
                if (isValid && !authError) {
                  handleSubmit();
                }
              }}
              error={(touched.password && !!errors.password) || !!authError}
            />
            {touched.password && (errors.password || !!authError) && (
              <ErrorMessage>{errors.password || authError}</ErrorMessage>
            )}
            <Button
              disabled={!isValid || !!authError || isLoading}
              onPress={handleSubmit}
              mode="contained"
              loading={isLoading}
              dark
              style={{ width: 120, alignSelf: 'flex-end', marginTop: 10 }}
            >
              Sign in
            </Button>
          </FormContainer>
        )}
      </Formik>
      <StagingDialog visible={visible} hideDialog={() => setVisible(false)} onConfirm={handleEasterEgg} />
    </ScrollView>
  );
};

export default LoginScreen;
